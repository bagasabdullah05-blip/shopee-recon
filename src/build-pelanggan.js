import { parseShopeeIncome } from './parse-shopee.js';
import { savePelanggan } from './db.js';

export function buildPelangganFromOrders(orders) {
  const map = new Map();
  for (const o of orders) {
    const key = o.usernamePembeli || 'tanpa_nama';
    if (!map.has(key)) map.set(key, { username: key, totalOrder: 0, totalBelanja: 0, totalDilepas: 0, jasaKirim: {}, produk: {}, pertama: o.waktuPesanan, terakhir: o.waktuPesanan, daftarPesanan: [] });
    const p = map.get(key);
    p.totalOrder += 1;
    p.totalBelanja += o.hargaProduk;
    p.totalDilepas += o.totalPenghasilan;
    p.jasaKirim[o.jasaKirim] = (p.jasaKirim[o.jasaKirim]||0)+1;
    p.produk[o.namaProduk] = (p.produk[o.namaProduk]||0)+1;
    if (o.waktuPesanan < p.pertama) p.pertama = o.waktuPesanan;
    if (o.waktuPesanan > p.terakhir) p.terakhir = o.waktuPesanan;
    p.daftarPesanan.push(o.noPesanan);
  }
  const list = Array.from(map.values()).sort((a,b)=>b.totalDilepas - a.totalDilepas);
  list.forEach((p,i)=> p.no = i+1);
  return list;
}

if (process.argv[1] && process.argv[1].includes('build-pelanggan')) {
  const file = process.argv[2] || 'data/Income.sudah dilepas.id.20260801_20260831.xlsx';
  const orders = parseShopeeIncome(file);
  const pelanggan = buildPelangganFromOrders(orders);
  savePelanggan(pelanggan);
  console.log(`Pelanggan: ${pelanggan.length} unik dari ${orders.length} order`);
  console.log(pelanggan.slice(0,3));
}
