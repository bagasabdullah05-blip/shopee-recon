import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const HPP_PATH = path.join(DATA_DIR, 'hpp.json');
const CUSTOMER_PATH = path.join(DATA_DIR, 'pelanggan.json');
const MONTHS_DIR = path.join(DATA_DIR, 'months');
const MONTHS_INDEX = path.join(MONTHS_DIR, 'index.json');
const AKUN_DIR = path.join(DATA_DIR, 'akun');
const MANUAL_BEBAN_PATH = path.join(DATA_DIR, 'manual-beban.json');

export function loadHpp() {
  if (!fs.existsSync(HPP_PATH)) return { produk: [] };
  return JSON.parse(fs.readFileSync(HPP_PATH, 'utf8'));
}
export function saveHpp(data) {
  fs.writeFileSync(HPP_PATH, JSON.stringify(data, null, 2));
}
export function getHppMap() {
  const d = loadHpp();
  const m = new Map();
  d.produk.forEach(p => m.set(p.id, p.hpp));
  d.produk.forEach(p => m.set(p.nama, p.hpp));
  return m;
}
export function loadPelanggan() {
  if (!fs.existsSync(CUSTOMER_PATH)) return [];
  return JSON.parse(fs.readFileSync(CUSTOMER_PATH, 'utf8'));
}
export function savePelanggan(list) {
  fs.writeFileSync(CUSTOMER_PATH, JSON.stringify(list, null, 2));
}
export function ensureMonthsDir() {
  if (!fs.existsSync(MONTHS_DIR)) fs.mkdirSync(MONTHS_DIR, { recursive: true });
  if (!fs.existsSync(MONTHS_INDEX)) fs.writeFileSync(MONTHS_INDEX, JSON.stringify([], null, 2));
}
export function loadMonthsIndex() {
  ensureMonthsDir();
  return JSON.parse(fs.readFileSync(MONTHS_INDEX, 'utf8'));
}
export function saveMonthsIndex(idx) {
  ensureMonthsDir();
  fs.writeFileSync(MONTHS_INDEX, JSON.stringify(idx, null, 2));
}
export function addMonthEntry(entry) {
  const idx = loadMonthsIndex();
  const existing = idx.findIndex(x => x.periode === entry.periode && (x.akun||'default')===(entry.akun||'default'));
  if (existing >= 0) idx[existing] = entry; else idx.push(entry);
  idx.sort((a,b)=>a.periode.localeCompare(b.periode));
  saveMonthsIndex(idx);
}

// === MULTI-AKUN (Node) ===
export function getAkunId(akun) { return akun || process.env.SHOPEE_AKUN || 'cbmajwastore'; }
export function getHppPathForAkun(akun) {
  const id=getAkunId(akun);
  if(id==='cbmajwastore') return HPP_PATH;
  return path.join(AKUN_DIR, `${id}_hpp.json`);
}
export function loadHppForAkun(akun) {
  const p=getHppPathForAkun(akun);
  if(!fs.existsSync(p)) return loadHpp();
  return JSON.parse(fs.readFileSync(p,'utf8'));
}
export function saveHppForAkun(data, akun) {
  const p=getHppPathForAkun(akun);
  if(p!==HPP_PATH){ if(!fs.existsSync(AKUN_DIR)) fs.mkdirSync(AKUN_DIR,{recursive:true}); }
  fs.writeFileSync(p, JSON.stringify(data,null,2));
}
export function getManualBebanMap() {
  if(!fs.existsSync(MANUAL_BEBAN_PATH)) return {};
  return JSON.parse(fs.readFileSync(MANUAL_BEBAN_PATH,'utf8'));
}
export function saveManualBebanMap(map) {
  fs.writeFileSync(MANUAL_BEBAN_PATH, JSON.stringify(map,null,2));
}
export function getManualTotal(periode, akun='default') {
  const map=getManualBebanMap();
  const key = akun ? `${akun}::${periode}` : periode;
  // support both flat (periode) and namespaced
  const arr = map[key] || map[periode] || [];
  return arr.reduce((a,b)=>a+Number(b.jumlah||0),0);
}
export function addManualBeban(periode, nama, jumlah, akun='default') {
  const map=getManualBebanMap();
  const key = `${getAkunId(akun)}::${periode}`;
  if(!map[key]) map[key]=[];
  map[key].push({nama, jumlah:Number(jumlah), tgl:new Date().toISOString()});
  saveManualBebanMap(map);
  return map[key];
}
