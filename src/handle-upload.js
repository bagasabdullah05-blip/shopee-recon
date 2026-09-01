import fs from 'fs';
import path from 'path';
import { parseShopeeIncome } from './parse-shopee.js';
import { buildPelangganFromOrders } from './build-pelanggan.js';
import { hitungLaba } from './laba.js';
import { loadHpp, savePelanggan, loadPelanggan, addMonthEntry, ensureMonthsDir, getAkunId, loadHppForAkun, getManualBebanMap } from './db.js';

export function processMonthUpload(inputPath, periode, akun=null) {
  // periode format YYYY-MM e.g. 2026-08
  const akunId=getAkunId(akun);
  const orders = parseShopeeIncome(inputPath);
  const hppData = loadHppForAkun(akunId);
  // hitung manual beban untuk periode ini (jika ada)
  const manualMap=getManualBebanMap();
  const manualKey=`${akunId}::${periode}`;
  const manualArr=manualMap[manualKey]||manualMap[periode]||[];
  const manualTotal=manualArr.reduce((a,b)=>a+Number(b.jumlah||0),0);
  const hppMap = (()=>{ const m=new Map(); hppData.produk?.forEach(p=>m.set(p.id,p.hpp)); hppData.produk?.forEach(p=>m.set(p.nama,p.hpp)); return m; })();
  const laba = hitungLaba(orders, hppMap, manualTotal);
  const pelangganBaru = buildPelangganFromOrders(orders);

  // merge pelanggan
  const existing = loadPelanggan();
  const map = new Map(existing.map(p=>[p.username,p]));
  for (const pb of pelangganBaru) {
    if (map.has(pb.username)) {
      const e = map.get(pb.username);
      e.totalOrder += pb.totalOrder;
      e.totalBelanja += pb.totalBelanja;
      e.totalDilepas += pb.totalDilepas;
      e.daftarPesanan = [...new Set([...e.daftarPesanan, ...pb.daftarPesanan])];
      if (pb.pertama < e.pertama) e.pertama = pb.pertama;
      if (pb.terakhir > e.terakhir) e.terakhir = pb.terakhir;
      // merge jasaKirim & produk
      for (const [k,v] of Object.entries(pb.jasaKirim)) e.jasaKirim[k]=(e.jasaKirim[k]||0)+v;
      for (const [k,v] of Object.entries(pb.produk)) e.produk[k]=(e.produk[k]||0)+v;
    } else {
      map.set(pb.username, pb);
    }
  }
  const merged = Array.from(map.values()).sort((a,b)=>b.totalDilepas - a.totalDilepas);
  merged.forEach((p,i)=>p.no=i+1);
  savePelanggan(merged);

  // simpan file per bulan (support multi-akun)
  ensureMonthsDir();
  const dest = path.join('data','months', `${akunId}_${periode}.xlsx`);
  fs.copyFileSync(inputPath, dest);
  // simpan ringkasan json
  fs.writeFileSync(path.join('data','months', `${akunId}_${periode}.json`), JSON.stringify({ periode, akun: akunId, orders: orders.length, ringkasan: laba.ringkasan, perProduk: laba.perProduk }, null, 2));
  addMonthEntry({ periode, akun: akunId, file: dest, totalOrder: orders.length, totalPenghasilan: laba.ringkasan.totalPenghasilan, totalSubtotal: laba.ringkasan.totalSubtotal, totalOngkirBersih: laba.ringkasan.totalOngkirBersih, totalManual: laba.ringkasan.totalManual, labaBersih: laba.ringkasan.labaBersih, diupload: new Date().toISOString() });

  return { periode, orders, laba, pelanggan: merged };
}

if (process.argv[1] && process.argv[1].includes('handle-upload')) {
  const file = process.argv[2];
  const periode = process.argv[3] || '2026-08';
  const akun = process.argv[4] || null;
  if (!file) { console.log('Usage: node src/handle-upload.js <file> [YYYY-MM] [akunId]'); process.exit(1); }
  const r = processMonthUpload(file, periode, akun);
  console.log(`✅ Periode ${periode} akun ${r.laba.ringkasan.akun||akun||'default'} diproses: ${r.orders.length} order, subtotal Rp ${r.laba.ringkasan.totalSubtotal?.toLocaleString('id-ID')} — penghasilan Rp ${r.laba.ringkasan.totalPenghasilan.toLocaleString('id-ID')} — ongkir bersih Rp ${r.laba.ringkasan.totalOngkirBersih?.toLocaleString('id-ID')} — laba ${r.laba.ringkasan.labaBersih} (manual Rp ${r.laba.ringkasan.totalManual})`);
}
