# Cara Aman Baca Laporan Shopee

## Kenapa Aman dari Banned?
- **TIDAK pakai API Shopee** dan **TIDAK pakai scraping/login otomatis**
- Hanya baca **file Excel (.xlsx) yang kamu export manual** dari Seller Center
- Proses 100% OFFLINE di komputer kamu, tidak kirim data ke server mana pun
- Tidak butuh username/password Shopee

## 3 Cara Pakai (pilih salah satu)

### Cara A (Paling Mudah - Double Klik)
1. Letakkan file `Income.sudah dilepas....xlsx` di folder `C:\shopee-recon\data\`
2. Double-klik `BACA_LAPORAN.bat`
3. Hasil ada di `output/Laporan_Shopee_BERSIH_YYYY-MM-DD.xlsx`

### Cara B (Drag & Drop)
Drag file Income.xlsx langsung ke `BACA_LAPORAN.bat`

### Cara C (Tanpa Install - Browser Offline)
1. Buka file `output/TOOL_OFFLINE_BACA_SHOPEE.html` (double klik, tidak perlu internet)
2. Upload file Shopee + file Internal (jika ada)
3. Klik Cocokkan → Export Hasil

## Hasil Excel Bersih berisi:
- Ringkasan: total order & total dilepas (sudah difilter Order saja, Sku diabaikan)
- Order Bersih: 1 baris 1 pesanan, kolom difilter, bisa di-sort
- Rekap Harian & Rekap Kurir

## Keamanan
- Semua file di `C:\shopee-recon\` - tidak ada akses internet
- Source code terbuka di `src/parse-shopee.js` bisa diaudit
- Jika butuh otomatis via API resmi nanti, gunakan Shopee Open Platform (daftar Partner ID) - bukan scraping
