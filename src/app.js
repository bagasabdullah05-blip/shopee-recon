import * as XLSX from 'xlsx';

let shopeeOrders = [];
let internalOrders = [];
let lastResult = null;

function parseShopeeIncomeFromWorkbook(wb) {
  const sheet = wb.Sheets['Penghasilan'];
  if (!sheet) throw new Error('Sheet Penghasilan tidak ditemukan');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerRowIndex = rows.findIndex(r => r.includes('No. Pesanan') && r.includes('Total Penghasilan'));
  if (headerRowIndex === -1) throw new Error('Header Penghasilan tidak ditemukan');
  const headers = rows[headerRowIndex];
  const idx = {};
  headers.forEach((h, i) => idx[h] = i);
  const dataRows = rows.slice(headerRowIndex + 1);
  const orders = [];
  for (const r of dataRows) {
    if (!r[idx['No. Pesanan']]) continue;
    if (r[idx['Lihat berdasarkan']] !== 'Order') continue;
    orders.push({
      noPesanan: String(r[idx['No. Pesanan']]).trim(),
      totalPenghasilan: Number(r[idx['Total Penghasilan']] || 0),
      hargaProduk: Number(r[idx['Harga Produk']] || 0),
      waktuPesanan: r[idx['Waktu Pesanan Dibuat']],
      tanggalDilepas: r[idx['Tanggal Dana Dilepaskan']],
      usernamePembeli: r[idx['Username (Pembeli)']],
      jasaKirim: r[idx['Jasa Kirim']],
      namaProduk: '',
      rawRow: r
    });
  }
  return orders;
}

function parseInternalFromWorkbook(wb) {
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rows.length === 0) return [];
  return rows.map(r => {
    const lower = {};
    for (const k of Object.keys(r)) lower[k.toLowerCase().trim()] = r[k];
    const get = (...keys) => {
      for (const k of keys) {
        const v = lower[k.toLowerCase()];
        if (v !== undefined && v !== '') return v;
      }
      return '';
    };
    return {
      noPesanan: String(get('no. pesanan', 'no pesanan', 'order id', 'order_id', 'order sn', 'no_pesanan', 'id pesanan', 'no') || '').trim(),
      total: Number(String(get('total', 'nominal', 'jumlah', 'penghasilan', 'net', 'amount', 'total penghasilan') || 0).toString().replace(/[^0-9\-]/g, '')) || 0,
      raw: r
    };
  }).filter(r => r.noPesanan);
}

function reconcile(shopeeOrders, internalOrders) {
  const mapShopee = new Map(shopeeOrders.map(o => [o.noPesanan, o]));
  const mapInternal = new Map(internalOrders.map(o => [String(o.noPesanan).trim(), o]));
  const cocok = [];
  const hanyaDiShopee = [];
  const hanyaDiInternal = [];
  const selisihNominal = [];
  for (const [id, s] of mapShopee) {
    if (mapInternal.has(id)) {
      const i = mapInternal.get(id);
      cocok.push({ id, shopee: s, internal: i });
      if (i.total && i.total !== s.totalPenghasilan) {
        selisihNominal.push({ id, shopee: s.totalPenghasilan, internal: i.total, selisih: s.totalPenghasilan - i.total });
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
      totalShopee, countShopee: shopeeOrders.length, countInternal: internalOrders.length,
      countCocok: cocok.length, countHanyaShopee: hanyaDiShopee.length, countHanyaInternal: hanyaDiInternal.length, countSelisih: selisihNominal.length
    },
    cocok, hanyaDiShopee, hanyaDiInternal, selisihNominal
  };
}

async function readWorkbook(file) {
  const buf = await file.arrayBuffer();
  return XLSX.read(buf, { type: 'array' });
}

document.getElementById('fShopee').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const wb = await readWorkbook(f);
    shopeeOrders = parseShopeeIncomeFromWorkbook(wb);
    document.getElementById('infoShopee').innerHTML = `✔ ${shopeeOrders.length} order terdeteksi (filter Order) • Total Rp ${shopeeOrders.reduce((a,b)=>a+b.totalPenghasilan,0).toLocaleString('id-ID')}`;
  } catch (err) {
    document.getElementById('infoShopee').textContent = 'Error: ' + err.message;
    shopeeOrders = [];
  }
});

document.getElementById('fInternal').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const wb = await readWorkbook(f);
    internalOrders = parseInternalFromWorkbook(wb);
    document.getElementById('infoInternal').innerHTML = `✔ ${internalOrders.length} baris internal terdeteksi`;
  } catch (err) {
    document.getElementById('infoInternal').textContent = 'Error: ' + err.message;
    internalOrders = [];
  }
});

document.getElementById('btnDemo').addEventListener('click', () => {
  if (shopeeOrders.length === 0) { alert('Upload file Shopee dulu'); return; }
  const demo = shopeeOrders.slice(0, 55).map(o => ({ noPesanan: o.noPesanan, total: o.totalPenghasilan }));
  demo.push({ noPesanan: 'DEMO999999', total: 50000 });
  if (demo.length > 2) demo[1].total = demo[1].total + 1000;
  internalOrders = demo;
  document.getElementById('infoInternal').innerHTML = `✔ Demo internal dimuat: ${internalOrders.length} baris (1 selisih sengaja, 1 hanya internal, ${shopeeOrders.length - 55} hanya Shopee)`;
});

document.getElementById('btnRecon').addEventListener('click', () => {
  if (shopeeOrders.length === 0) { alert('Upload file Shopee Income dulu'); return; }
  if (internalOrders.length === 0) { alert('Upload file Internal dulu atau klik Muat Contoh Internal'); return; }
  lastResult = reconcile(shopeeOrders, internalOrders);
  showResult(lastResult);
});

function showResult(res) {
  document.getElementById('result').style.display = 'block';
  document.getElementById('btnExport').disabled = false;
  const k = res.ringkasan;
  document.getElementById('kpi').innerHTML = `
    <div><span>Cocok</span><b style="color:#16a34a">${k.countCocok}</b></div>
    <div><span>Hanya Shopee</span><b style="color:#ea580c">${k.countHanyaShopee}</b></div>
    <div><span>Hanya Internal</span><b style="color:#dc2626">${k.countHanyaInternal}</b></div>
    <div><span>Selisih Nominal</span><b style="color:#ca8a04">${k.countSelisih}</b></div>
  ` + `<div><span>Total Shopee</span><b>Rp ${k.totalShopee.toLocaleString('id-ID')}</b></div><div><span>Total Order Shopee</span><b>${k.countShopee}</b></div><div><span>Total Internal</span><b>${k.countInternal}</b></div><div></div>`;
  renderTab('cocok');
}

let currentTab = 'cocok';
document.querySelectorAll('.tabs button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderTab(b.dataset.tab);
  });
});

function renderTab(tab) {
  currentTab = tab;
  if (!lastResult) return;
  const thead = document.querySelector('#tbl thead');
  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';
  if (tab === 'cocok') {
    thead.innerHTML = '<tr><th>No. Pesanan</th><th>Tgl Dilepas</th><th>Shopee Total</th><th>Internal Total</th><th>Status</th></tr>';
    lastResult.cocok.forEach(r => {
      const selisih = r.shopee.totalPenghasilan !== r.internal.total;
      tbody.innerHTML += `<tr><td>${r.id}</td><td>${r.shopee.tanggalDilepas}</td><td>Rp ${r.shopee.totalPenghasilan.toLocaleString('id-ID')}</td><td>Rp ${r.internal.total.toLocaleString('id-ID')}</td><td><span class="badge ${selisih?'warn':'ok'}">${selisih?'SELISIH':'COCOK'}</span></td></tr>`;
    });
  } else if (tab === 'hanyaShopee') {
    thead.innerHTML = '<tr><th>No. Pesanan</th><th>Tgl Dilepas</th><th>Total Shopee</th><th>Pembeli</th></tr>';
    lastResult.hanyaDiShopee.forEach(r => {
      tbody.innerHTML += `<tr><td>${r.noPesanan}</td><td>${r.tanggalDilepas}</td><td>Rp ${r.totalPenghasilan.toLocaleString('id-ID')}</td><td>${r.usernamePembeli}</td></tr>`;
    });
  } else if (tab === 'hanyaInternal') {
    thead.innerHTML = '<tr><th>No. Pesanan</th><th>Internal Total</th></tr>';
    lastResult.hanyaDiInternal.forEach(r => {
      tbody.innerHTML += `<tr><td>${r.noPesanan}</td><td>Rp ${r.total.toLocaleString('id-ID')}</td></tr>`;
    });
  } else if (tab === 'selisih') {
    thead.innerHTML = '<tr><th>No. Pesanan</th><th>Shopee</th><th>Internal</th><th>Selisih</th></tr>';
    lastResult.selisihNominal.forEach(r => {
      tbody.innerHTML += `<tr><td>${r.id}</td><td>Rp ${r.shopee.toLocaleString('id-ID')}</td><td>Rp ${r.internal.toLocaleString('id-ID')}</td><td style="color:${r.selisih>0?'#16a34a':'#dc2626'}">Rp ${r.selisih.toLocaleString('id-ID')}</td></tr>`;
    });
  }
  if (tbody.innerHTML === '') tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:20px">Tidak ada data</td></tr>';
}

document.getElementById('btnExport').addEventListener('click', () => {
  if (!lastResult) return;
  const wb = XLSX.utils.book_new();
  const summary = [
    ['Ringkasan Rekonsiliasi'],
    ['Total Shopee (Rp)', lastResult.ringkasan.totalShopee],
    ['Jumlah Order Shopee', lastResult.ringkasan.countShopee],
    ['Jumlah Internal', lastResult.ringkasan.countInternal],
    ['Cocok', lastResult.ringkasan.countCocok],
    ['Hanya Shopee', lastResult.ringkasan.countHanyaShopee],
    ['Hanya Internal', lastResult.ringkasan.countHanyaInternal],
    ['Selisih Nominal', lastResult.ringkasan.countSelisih],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Ringkasan');
  const cocok = [['No Pesanan','Tanggal Dilepas','Shopee Total','Internal Total','Selisih','Status'], ...lastResult.cocok.map(r => [r.id, r.shopee.tanggalDilepas, r.shopee.totalPenghasilan, r.internal.total, r.shopee.totalPenghasilan - r.internal.total, r.shopee.totalPenghasilan===r.internal.total?'COCOK':'SELISIH'])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cocok), 'Cocok');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['No Pesanan','Tanggal Dilepas','Total Shopee','Pembeli'], ...lastResult.hanyaDiShopee.map(r=>[r.noPesanan,r.tanggalDilepas,r.totalPenghasilan,r.usernamePembeli])]), 'Hanya_Shopee');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['No Pesanan','Internal Total'], ...lastResult.hanyaDiInternal.map(r=>[r.noPesanan,r.total])]), 'Hanya_Internal');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['No Pesanan','Shopee','Internal','Selisih'], ...lastResult.selisihNominal.map(r=>[r.id,r.shopee,r.internal,r.selisih])]), 'Selisih');
  XLSX.writeFile(wb, `Recon_Shopee_${new Date().toISOString().slice(0,10)}.xlsx`);
});
