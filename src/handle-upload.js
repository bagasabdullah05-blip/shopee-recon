import fs from 'fs';
import path from 'path';
import { parseShopeeIncome } from './parse-shopee.js';
import { buildPelangganFromOrders } from './build-pelanggan.js';
import { hitungLaba } from './laba.js';
import { loadHpp, savePelanggan, loadPelanggan, addMonthEntry, ensureMonthsDir } from './db.js';

export function processMonthUpload(inputPath, periode) {
  // periode format YYYY-MM e.g. 2026-08
  const orders = parseShopeeIncome(inputPath);
  const hppData = loadHpp();
  const laba = hitungLaba(orders);
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

  // simpan file per bulan
  ensureMonthsDir();
  const dest = path.join('data','months', `${periode}.xlsx`);
  fs.copyFileSync(inputPath, dest);
  // simpan ringkasan json
  fs.writeFileSync(path.join('data','months', `${periode}.json`), JSON.stringify({ periode, orders: orders.length, ringkasan: laba.ringkasan, perProduk: laba.perProduk }, null, 2));
  addMonthEntry({ periode, file: dest, totalOrder: orders.length, totalPenghasilan: laba.ringkasan.totalPenghasilan, labaBersih: laba.ringkasan.labaBersih, diupload: new Date().toISOString() });

  return { periode, orders, laba, pelanggan: merged };
}

if (process.argv[1] && process.argv[1].includes('handle-upload')) {
  const file = process.argv[2];
  const periode = process.argv[3] || '2026-08';
  if (!file) { console.log('Usage: node src/handle-upload.js <file> [YYYY-MM]'); process.exit(1); }
  const r = processMonthUpload(file, periode);
  console.log(`✅ Periode ${periode} diproses: ${r.orders.length} order, laba ${r.laba.ringkasan.labaBersih}`);
}
