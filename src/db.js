import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const HPP_PATH = path.join(DATA_DIR, 'hpp.json');
const CUSTOMER_PATH = path.join(DATA_DIR, 'pelanggan.json');
const MONTHS_DIR = path.join(DATA_DIR, 'months');
const MONTHS_INDEX = path.join(MONTHS_DIR, 'index.json');

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
  const existing = idx.findIndex(x => x.periode === entry.periode);
  if (existing >= 0) idx[existing] = entry; else idx.push(entry);
  idx.sort((a,b)=>a.periode.localeCompare(b.periode));
  saveMonthsIndex(idx);
}
