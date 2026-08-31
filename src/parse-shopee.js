import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export function parseShopeeIncome(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets['Penghasilan'];
  if (!sheet) throw new Error('Sheet Penghasilan tidak ditemukan');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerRowIndex = rows.findIndex(r => r.includes('No. Pesanan') && r.includes('Total Penghasilan'));
  if (headerRowIndex === -1) throw new Error('Header Penghasilan tidak ditemukan');
  const headers = rows[headerRowIndex];
  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  const dataRows = rows.slice(headerRowIndex + 1);
  const skuMap = new Map();
  for (const r of dataRows) {
    if (r[idx['Lihat berdasarkan']] !== 'Sku') continue;
    const id = String(r[idx['No. Pesanan']]).trim();
    if (!skuMap.has(id)) skuMap.set(id, []);
    skuMap.get(id).push({
      idProduk: r[idx['ID Produk']],
      namaProduk: r[idx['Nama Produk']],
    });
  }
  const orders = [];
  for (const r of dataRows) {
    if (!r[idx['No. Pesanan']] || r[idx['No. Pesanan']] === 'No. Pesanan') continue;
    if (r[idx['Lihat berdasarkan']] !== 'Order') continue;
    const id = String(r[idx['No. Pesanan']]).trim();
    const skuList = skuMap.get(id) || [];
    const namaProduk = skuList.map(s=>s.namaProduk).join(' | ') || '-';
    const idProduk = skuList.map(s=>s.idProduk).join(',') || '-';
    orders.push({
      noPesanan: id,
      tipe: r[idx['Lihat berdasarkan']],
      totalPenghasilan: Number(r[idx['Total Penghasilan']] || 0),
      hargaProduk: Number(r[idx['Harga Produk']] || 0),
      jumlahPengembalian: Number(r[idx['Jumlah Pengembalian Dana ke Pembeli']] || 0),
      ongkirDibayarPembeli: Number(r[idx['Ongkir Dibayar Pembeli']] || 0),
      ongkosKirimKeJasa: Number(r[idx['Ongkos Kirim yang Dibayarkan ke Jasa Kirim']] || 0),
      potonganOngkirJasaKirim: Number(r[idx['Potongan Ongkos Kirim dari Jasa Kirim']] || 0),
      gratisOngkirShopee: Number(r[idx['Gratis Ongkir dari Shopee']] || 0),
      ongkirPengembalian: Number(r[idx['Ongkos Kirim Pengembalian Barang']] || 0),
      biayaAdmin: Number(r[idx['Biaya Administrasi (termasuk PPN 11%)']] || 0),
      biayaProses: Number(r[idx['Biaya Proses Pesanan']] || 0),
      biayaPembayaran: Number(r[idx['Biaya Pembayaran']] || 0),
      biayaGratisOngkirXTRA: Number(r[idx['Biaya Gratis Ongkir XTRA - Ukuran Biasa (Kategori E)']] || 0),
      biayaTransaksi: Number(r[idx['Biaya Transaksi']] || 0),
      biayaLayananPromoXTRA: Number(r[idx['Biaya Layanan Promo XTRA']] || 0),
      biayaKampanye: Number(r[idx['Biaya Kampanye']] || 0),
      biayaKomisiAMS: Number(r[idx['Biaya Komisi AMS']] || 0),
      biayaIsiSaldo: Number(r[idx['Biaya Isi Saldo Otomatis (dari Penghasilan)']] || 0),
      premi: Number(r[idx['Premi']] || 0),
      pph22: Number(r[idx['PPh 22']] || 0),
      waktuPesanan: r[idx['Waktu Pesanan Dibuat']],
      tanggalDilepas: r[idx['Tanggal Dana Dilepaskan']],
      metodePelepasan: r[idx['Metode Pelepasan Dana']],
      usernamePembeli: r[idx['Username (Pembeli)']],
      jasaKirim: r[idx['Jasa Kirim']],
      statusPesanan: r[idx['Tipe Pesanan']],
      namaProduk,
      idProduk,
      jumlahSku: skuList.length
    });
  }
  return orders;
}

export function parseSummary(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets['Summary'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const flat = {};
  for (const r of rows) {
    for (let i = 0; i < r.length; i++) {
      if (typeof r[i] === 'string' && r[i].includes('Total yang Dilepas')) {
        flat.totalDilepas = Number(r[r.length - 1] || rows[rows.indexOf(r) + 1]?.[3] || 0);
      }
    }
  }
  let totalDilepas = 0;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).includes('Total yang Dilepas')) {
      totalDilepas = Number(rows[i][3] || rows[i][1] || 0);
    }
  }
  return { totalDilepas, raw: rows };
}

export function parseSellerFee(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets['Seller Fee'];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = rows.findIndex(r => r.includes('No. Pesanan'));
  if (headerIdx === -1) return [];
  const headers = rows[headerIdx];
  const idx = {};
  headers.forEach((h, i) => idx[h] = i);
  return rows.slice(headerIdx + 1).filter(r => r[idx['No. Pesanan']]).map(r => ({
    noPesanan: String(r[idx['No. Pesanan']]),
    biayaPlatform: Number(r[idx['Biaya Platform']] || 0),
    biayaGratisOngkirXTRA: Number(r[idx['Biaya Gratis Ongkir XTRA']] || 0),
    biayaLayanan: Number(r[idx['Biaya Layanan']] || 0),
    biayaPromosi: Number(r[idx['Biaya Promosi']] || 0)
  }));
}

export function reconcile(shopeeOrders, internalOrders, keyInternal = 'noPesanan') {
  const mapShopee = new Map(shopeeOrders.map(o => [o.noPesanan, o]));
  const mapInternal = new Map(internalOrders.map(o => [String(o[keyInternal]).trim(), o]));

  const cocok = [];
  const hanyaDiShopee = [];
  const hanyaDiInternal = [];
  const selisihNominal = [];

  for (const [id, s] of mapShopee) {
    if (mapInternal.has(id)) {
      const i = mapInternal.get(id);
      cocok.push({ id, shopee: s, internal: i });
      const nominalInternal = Number(i.total || i.nominal || i.jumlah || 0);
      if (nominalInternal && nominalInternal !== s.totalPenghasilan) {
        selisihNominal.push({ id, shopee: s.totalPenghasilan, internal: nominalInternal, selisih: s.totalPenghasilan - nominalInternal });
      }
    } else {
      hanyaDiShopee.push(s);
    }
  }
  for (const [id, i] of mapInternal) {
    if (!mapShopee.has(id)) hanyaDiInternal.push(i);
  }

  const totalShopee = shopeeOrders.reduce((a, b) => a + b.totalPenghasilan, 0);
  return {
    ringkasan: {
      totalShopee,
      countShopee: shopeeOrders.length,
      countInternal: internalOrders.length,
      countCocok: cocok.length,
      countHanyaShopee: hanyaDiShopee.length,
      countHanyaInternal: hanyaDiInternal.length,
      countSelisih: selisihNominal.length
    },
    cocok, hanyaDiShopee, hanyaDiInternal, selisihNominal
  };
}

if (process.argv[1] && process.argv[1].includes('parse-shopee')) {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node src/parse-shopee.js <path-to-xlsx>');
    process.exit(1);
  }
  const orders = parseShopeeIncome(file);
  console.log(`Parsed ${orders.length} orders (filter Lihat berdasarkan=Order)`);
  console.log(JSON.stringify(orders.slice(0, 2), null, 2));
  console.log('Total Penghasilan:', orders.reduce((a, b) => a + b.totalPenghasilan, 0));
}
