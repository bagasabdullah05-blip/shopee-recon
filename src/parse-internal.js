import XLSX from 'xlsx';

export function parseInternal(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rows.length === 0) return [];
  const normalized = rows.map(r => {
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
      noPesanan: String(get('no. pesanan', 'no pesanan', 'order id', 'order_id', 'order sn', 'no_pesanan', 'id pesanan') || '').trim(),
      tanggal: get('tanggal', 'waktu', 'date', 'tgl'),
      total: Number(String(get('total', 'nominal', 'jumlah', 'penghasilan', 'net', 'amount') || 0).toString().replace(/[^0-9\-]/g, '')) || 0,
      raw: r
    };
  }).filter(r => r.noPesanan);
  return normalized;
}
