import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { parseShopeeIncome, parseSellerFee } from './parse-shopee.js';

function buildCleanExcel(inputPath, outputPath) {
  const orders = parseShopeeIncome(inputPath);
  let sellerFeeMap = new Map();
  try {
    const fees = parseSellerFee(inputPath);
    fees.forEach(f => sellerFeeMap.set(f.noPesanan, f));
  } catch {}

  const wb = XLSX.readFile(inputPath);
  const summarySheet = wb.Sheets['Summary'];
  let summaryRows = [];
  if (summarySheet) {
    const r = XLSX.utils.sheet_to_json(summarySheet, { header: 1, defval: '' });
    summaryRows = r;
  }

  const out = XLSX.utils.book_new();

  // Sheet 1: Ringkasan (copy info penting)
  const ringkas = [
    ['RINGKASAN LAPORAN SHOPEE - SUDAH DILEPAS'],
    ['File sumber', path.basename(inputPath)],
    ['Tanggal proses', new Date().toLocaleString('id-ID')],
    [],
    ['Total Order (unik)', orders.length],
    ['Total Penghasilan Dilepas (Rp)', orders.reduce((a,b)=>a+b.totalPenghasilan,0)],
    ['Total Harga Produk (Rp)', orders.reduce((a,b)=>a+b.hargaProduk,0)],
    ['Total Biaya Admin (Rp)', orders.reduce((a,b)=>a+b.biayaAdmin,0)],
    [],
    ['Catatan:'],
    ['- Hanya baris Lihat berdasarkan = Order (baris Sku diabaikan agar tidak double)'],
    ['- Nilai diambil dari sheet Penghasilan kolom Total Penghasilan, Harga Produk, dll'],
  ];
  XLSX.utils.book_append_sheet(out, XLSX.utils.aoa_to_sheet(ringkas), 'Ringkasan');

  // Sheet 2: Data Bersih per Order (mudah dibaca & difilter)
  const header = ['No','No. Pesanan','Waktu Pesanan','Tanggal Dilepas','Pembeli','Jasa Kirim','Nama Produk','Harga Produk','Total Penghasilan','Biaya Admin','Biaya Proses','Biaya Pembayaran','Gratis Ongkir XTRA','Layanan Promo XTRA'];
  const data = orders.map((o,i)=> [
    i+1,
    o.noPesanan,
    o.waktuPesanan,
    o.tanggalDilepas,
    o.usernamePembeli,
    o.jasaKirim,
    o.namaProduk,
    o.hargaProduk,
    o.totalPenghasilan,
    o.biayaAdmin,
    o.biayaProses,
    o.biayaPembayaran,
    o.biayaGratisOngkirXTRA,
    o.biayaLayananPromoXTRA
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  ws['!cols'] = [{wch:4},{wch:16},{wch:12},{wch:14},{wch:16},{wch:14},{wch:42},{wch:13},{wch:16},{wch:13},{wch:13},{wch:14},{wch:16},{wch:16}];
  ws['!autofilter'] = { ref: `A1:N${data.length+1}` };
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(out, ws, 'Order Bersih');

  // Sheet 3: Rekap Harian
  const perTanggal = {};
  orders.forEach(o=>{
    const t = o.tanggalDilepas || 'Tanpa tanggal';
    if(!perTanggal[t]) perTanggal[t]={count:0,total:0};
    perTanggal[t].count++;
    perTanggal[t].total+=o.totalPenghasilan;
  });
  const rekap = [['Tanggal Dilepas','Jumlah Order','Total Dilepas (Rp)'], ...Object.entries(perTanggal).sort().map(([tgl,v])=>[tgl,v.count,v.total])];
  const ws3 = XLSX.utils.aoa_to_sheet(rekap);
  ws3['!cols'] = [{wch:16},{wch:14},{wch:18}];
  XLSX.utils.book_append_sheet(out, ws3, 'Rekap Harian');

  // Sheet 4: Rekap Jasa Kirim
  const perKurir = {};
  orders.forEach(o=>{
    const k = o.jasaKirim || 'Lainnya';
    if(!perKurir[k]) perKurir[k]={count:0,total:0};
    perKurir[k].count++;
    perKurir[k].total+=o.totalPenghasilan;
  });
  const rekapKurir = [['Jasa Kirim','Jumlah Order','Total Dilepas (Rp)'], ...Object.entries(perKurir).map(([k,v])=>[k,v.count,v.total])];
  const ws4 = XLSX.utils.aoa_to_sheet(rekapKurir);
  ws4['!cols'] = [{wch:18},{wch:14},{wch:18}];
  XLSX.utils.book_append_sheet(out, ws4, 'Rekap Kurir');

  // Sheet 5: Rekap Produk (produk apa saja)
  const perProduk = {};
  orders.forEach(o=>{
    const p = o.namaProduk || 'Tanpa Nama';
    if(!perProduk[p]) perProduk[p]={count:0,total:0,harga:0};
    perProduk[p].count++;
    perProduk[p].total+=o.totalPenghasilan;
    perProduk[p].harga+=o.hargaProduk;
  });
  const rekapProduk = [['Nama Produk','Jumlah Transaksi','Total Harga Produk (Rp)','Total Dilepas (Rp)','Rata-rata Dilepas (Rp)'], ...Object.entries(perProduk).sort((a,b)=>b[1].count-a[1].count).map(([p,v])=>[p,v.count,v.harga,v.total,Math.round(v.total/v.count)])];
  const ws5 = XLSX.utils.aoa_to_sheet(rekapProduk);
  ws5['!cols'] = [{wch:60},{wch:16},{wch:20},{wch:18},{wch:18}];
  ws5['!autofilter'] = { ref: `A1:E${rekapProduk.length}` };
  ws5['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(out, ws5, 'Rekap Produk');

  // Sheet 6: Timeline Transaksi (kapan)
  const perWaktu = {};
  orders.forEach(o=>{
    const w = o.waktuPesanan || 'Tanpa tanggal';
    if(!perWaktu[w]) perWaktu[w]={count:0,total:0};
    perWaktu[w].count++;
    perWaktu[w].total+=o.totalPenghasilan;
  });
  const timeline = [['Waktu Pesanan Dibuat','Jumlah Order','Total Dilepas (Rp)'], ...Object.entries(perWaktu).sort().map(([w,v])=>[w,v.count,v.total])];
  const ws6 = XLSX.utils.aoa_to_sheet(timeline);
  ws6['!cols'] = [{wch:18},{wch:14},{wch:18}];
  ws6['!autofilter'] = { ref: `A1:C${timeline.length}` };
  XLSX.utils.book_append_sheet(out, ws6, 'Timeline Pesanan');
  const ws7 = XLSX.utils.aoa_to_sheet([['Tanggal Dana Dilepas','Jumlah Order','Total Dilepas (Rp)'], ...Object.entries(perTanggal).sort().map(([tgl,v])=>[tgl,v.count,v.total])]);
  // sudah ada Rekap Harian, jadi timeline dana dilepas sudah terwakili

  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), {recursive:true});
  XLSX.writeFile(out, outputPath);
  console.log(`✅ File bersih dibuat: ${outputPath}`);
  console.log(`   Order: ${orders.length}, Total: Rp ${orders.reduce((a,b)=>a+b.totalPenghasilan,0).toLocaleString('id-ID')}`);
  return outputPath;
}

const input = process.argv[2] || 'data/test-shopee.xlsx';
const output = process.argv[3] || `output/Laporan_Shopee_BERSIH_${new Date().toISOString().slice(0,10)}.xlsx`;
buildCleanExcel(input, output);
