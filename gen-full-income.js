import XLSX from 'xlsx';

const produkMap = {
  "2608235DUJYERU":["5645966964","Susu Kambing Etawa CBM 200gr - Baik UntukTulang dan Sendi"],
  "260827FDRXQNA9":["5645966964","Susu Kambing Etawa CBM 200gr - Baik UntukTulang dan Sendi"],
  "260827DCR48S6U":["3948886334","Sari Kurma Ajwa Plus Angkak CBM 350gr - Menaikkan Trombosit"],
  "2608234F3QBEKR":["48606298128","Citachanna Kapsul Ikan Gabus 50 Kapsul - Solusi Luka Cepat"],
  "2608247DT1X063":["40828836711","Kurma Khalas Saad Premium Original 500gr & 1kg"],
  "2608222GVGJ6G1":["40828836711","Kurma Khalas Saad Premium Original 500gr & 1kg"],
  "2608247NDR4VSF":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260815CM56FXGY":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "260821VWS7RS71":["40828836711","Kurma Khalas Saad Premium Original 500gr & 1kg"],
  "260819PY03S3JV":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "2608210A485KNK":["57350026035","CBM AJWA Keladicer Keladi Tikus 50 Kapsul"],
  "260820TXYW5XC1":["46455823486","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis Isi 3"],
  "260815DM666P4X":["55505799708","Sari Kurma Ajwa Ekstrak Angkak CBM 350gr"],
  "260821VM92N2W4":["46563335531","Kapsul Angkak Pukang Isi 50 kapsul"],
  "260819RBBM9PE5":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "2608138YT5KNVW":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "260815DQRBR4P9":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "2608139BYFGHGJ":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260815E0YWA8RM":["51206329934","KURMA SUKARI Al Qosim Premium 500gr - 1kg"],
  "260814BH3XCUR4":["40828836711","Kurma Khalas Saad Premium Original 500gr & 1kg"],
  "26081266VC7U4P":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260815DXHXEBW2":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260815DVTCSPE4":["55505799708","Sari Kurma Ajwa Ekstrak Angkak CBM 350gr"],
  "26081398NYG37Q":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "260816H1VQ97D6":["50956336497","KURMA TUNIS 500gr dan 1 kg - FREE SUSU"],
  "260814ANC4ETQY":["5343854077","CBM AJWA Madu Murni Kemasan Pouch dan Jerigen"],
  "26081274XT79WS":["50956336497","KURMA TUNIS 500gr dan 1 kg - FREE SUSU"],
  "260807QF723P49":["11026392236","Susu Ettawa CBM Plus Gula Batu 200gr"],
  "26081391XKABN8":["40828836711","Kurma Khalas Saad Premium Original 500gr & 1kg"],
  "2608114GSJP971":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "2608114D02H92X":["48606298128","Citachanna Kapsul Ikan Gabus 50 Kapsul"],
  "2608113NJAVVNS":["6040891422","Madu Batuk ASYIFA Original 175 gram"],
  "260806MBU71R1F":["57350026035","CBM AJWA Keladicer Keladi Tikus 50 Kapsul"],
  "260803DPD2XDM0":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "260809V9RBYJMR":["26663469503","Minyak Kelapa VCO Halmahera CBM 120ML"],
  "260808SG05NV52":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260804EFX2217D":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260808RXUP8DXV":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260805JK0RM6RA":["56800016777","CBM Citagerd Madu Kunyit 175g Untuk Asam Lambung"],
  "260803CVK11SG3":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260808SVJG7GY0":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260803BB46ECDY":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260808R7H7G6XA":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260806MM34RD13":["51206329934","KURMA SUKARI Al Qosim Premium 500gr - 1kg"],
  "260802AT6Q46KA":["48606298128","Citachanna Kapsul Ikan Gabus 50 Kapsul"],
  "260806N2933KR4":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260806ME3GJXR6":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260804G38JTPCX":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260807PNU56YED":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260803D28C3Y5U":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260727RHCFGUG1":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260803DDAW2H5U":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "26080185MCXJ3B":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "26072912EGDH36":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "260728SW584CTE":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
  "260727RHN6X7TP":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260803DF8PXE3S":["29666977336","Sari Kurma Ajwa CBM ORIGINAL 350gr Plus Propolis"],
  "2607290R5MPX3W":["7373306057","Sari Kurma Ajwa Angkak CBM 350gr PROMO 1"],
  "260728U995BGK3":["5940805406","Sari Kurma Ajwa CBM ORIGINAL 100% 350gr Plus Propolis"],
};
const orders = [
  ["2608235DUJYERU",152910,117852,0,-33000,33000,-15597,-1250,-2752,-6881,-6881,"2026-08-23","2026-08-31","allnewrealme","SPX Instant"],
  ["260827FDRXQNA9",50970,35221,0,-14000,14000,-5199,-1250,-917,-2294,-2294,"2026-08-27","2026-08-30","sariisok","SPX Instant Prioritas"],
  ["260827DCR48S6U",53816,42281,0,-3700,3700,-3875,-1250,-969,-2422,-2422,"2026-08-26","2026-08-30","hk6euwqf7q","SPX Hemat"],
  ["2608234F3QBEKR",98000,78022,0,-10000,10000,-7056,-1250,-1764,-4410,-4410,"2026-08-23","2026-08-30","vey.evandha","SPX Instant Prioritas"],
  ["2608247DT1X063",70000,53273,1000,-32000,31000,-7140,-1250,-1260,-3150,-3150,"2026-08-24","2026-08-29","190yahyamakassar","SPX Standard"],
  ["2608222GVGJ6G1",35000,26011,1000,-32000,31000,-3570,-1250,-630,-1575,-1575,"2026-08-22","2026-08-29","190yahyamakassar","SPX Standard"],
  ["2608247NDR4VSF",54862,43127,0,-6500,6500,-3950,-1250,-988,-2469,-2469,"2026-08-24","2026-08-28","dedipelonk","SPX Standard"],
  ["260815CM56FXGY",45000,35150,0,-26000,26000,-3240,-1250,-810,-2025,-2025,"2026-08-15","2026-08-28","abdi_201924","SPX Hemat"],
  ["260821VWS7RS71",35000,26011,0,-5000,5000,-3570,-1250,-630,-1575,-1575,"2026-08-21","2026-08-26","yongkysaputra009","Anteraja Economy"],
  ["260819PY03S3JV",45000,35150,0,-10000,10000,-3240,-1250,-810,-2025,-2025,"2026-08-19","2026-08-26","adeiraone","SPX Instant Prioritas"],
  ["2608210A485KNK",70000,55373,0,-6500,6500,-5040,-1250,-1260,-3150,-3150,"2026-08-21","2026-08-25","tnmngicvke","SPX Standard"],
  ["260820TXYW5XC1",111150,88658,0,-6500,6500,-8003,-1250,-2001,-5002,-5002,"2026-08-20","2026-08-24","1234romi","SPX Standard"],
  ["260815DM666P4X",57000,38860,0,-8000,8000,-5814,-1250,-1026,-2565,-2565,"2026-08-15","2026-08-24","f7828vlv1u","SPX Standard"],
  ["260821VM92N2W4",150000,120085,0,-8000,8000,-10800,-1250,-2700,-6750,-6750,"2026-08-21","2026-08-23","1sa7nuf_gv","JNE Reguler"],
  ["260819RBBM9PE5",54862,43127,0,-6500,6500,-3950,-1250,-988,-2469,-2469,"2026-08-19","2026-08-23","q71l_bjtb_","SPX Standard"],
  ["2608138YT5KNVW",42750,33329,0,-10000,10000,-3078,-1250,-770,-1924,-1924,"2026-08-13","2026-08-23","rinsgood14","SPX Hemat"],
  ["260815DQRBR4P9",42750,33329,0,-3500,3500,-3078,-1250,-770,-1924,-1924,"2026-08-15","2026-08-22","tsn9jonz92","SPX Hemat"],
  ["2608139BYFGHGJ",43054,33577,0,-3500,3500,-3100,-1250,-775,-1937,-1937,"2026-08-13","2026-08-22","winartisujadi","SPX Hemat"],
  ["260815E0YWA8RM",80000,61062,0,-8000,8000,-8160,-1250,-1440,-3600,-3600,"2026-08-15","2026-08-20","yatimonglay","Anteraja Reguler"],
  ["260814BH3XCUR4",35000,26011,1000,-32000,31000,-3570,-1250,-630,-1575,-1575,"2026-08-14","2026-08-20","190yahyamakassar","SPX Standard"],
  ["26081266VC7U4P",54862,43127,0,-6500,6500,-3950,-1250,-988,-2469,-2469,"2026-08-12","2026-08-20","fitriyuni222","SPX Standard"],
  ["260815DXHXEBW2",43054,33577,3700,-3700,0,-3100,-1250,-775,-1937,-1937,"2026-08-15","2026-08-19","warjoko1","SPX Hemat"],
  ["260815DVTCSPE4",57000,43147,0,-8000,8000,-5814,-1250,-1026,-2565,-2565,"2026-08-15","2026-08-19","henyali72","Anteraja Reguler"],
  ["26081398NYG37Q",42750,31431,0,-8000,8000,-3078,-1250,-770,-1924,-1924,"2026-08-13","2026-08-19","shidra","Anteraja Reguler"],
  ["260816H1VQ97D6",80000,61062,0,-8000,8000,-8160,-1250,-1440,-3600,-3600,"2026-08-16","2026-08-18","mamichel","JNE Reguler"],
  ["260814ANC4ETQY",57750,43729,0,-8000,8000,-5891,-1250,-1040,-2599,-2599,"2026-08-14","2026-08-17","nurhajatialmaida","SPX Standard"],
  ["26081274XT79WS",50000,37695,0,-3500,3500,-5100,-1250,-900,-2250,-2250,"2026-08-12","2026-08-16","hanifah2719","SPX Hemat"],
  ["260807QF723P49",96842,67447,0,-6500,6500,-6973,-1250,-1743,-4358,-4358,"2026-08-07","2026-08-16","allnewrealme","SPX Standard"],
  ["26081391XKABN8",70000,53273,0,-6500,6500,-7140,-1250,-1260,-3150,-3150,"2026-08-13","2026-08-15","oktafianrizky26","SPX Standard"],
  ["2608114GSJP971",42750,33329,0,-5000,5000,-3078,-1250,-770,-1924,-1924,"2026-08-11","2026-08-15","kamalin08","SPX Hemat"],
  ["2608114D02H92X",88200,64437,0,-6500,6500,-6350,-1250,-1588,-3969,-3969,"2026-08-11","2026-08-15","yudiariyanto516","SPX Standard"],
  ["2608113NJAVVNS",38760,27521,0,-6500,6500,-2791,-1250,-698,-1744,-1744,"2026-08-11","2026-08-15","rindarsih18","Anteraja Reguler"],
  ["260806MBU71R1F",70000,49837,0,-6500,6500,-5040,-1250,-1260,-3150,-3150,"2026-08-06","2026-08-15","pakendrowahyu","SPX Standard"],
  ["260803DPD2XDM0",42750,33329,0,-5000,5000,-3078,-1250,-770,-1924,-1924,"2026-08-03","2026-08-15","handayani.23.","SPX Hemat"],
  ["260809V9RBYJMR",119010,95018,0,-6500,6500,-8569,-1250,-2142,-5355,-5355,"2026-08-09","2026-08-13","kkartikaa23","SPX Standard"],
  ["260808SG05NV52",48132,37684,0,-3500,3500,-3466,-1250,-866,-2166,-2166,"2026-08-08","2026-08-13","z935025g53","SPX Hemat"],
  ["260804EFX2217D",41694,32477,0,-6500,6500,-3002,-1250,-750,-1876,-1876,"2026-08-04","2026-08-13","wahyu_martanti","SPX Standard"],
  ["260808RXUP8DXV",73734,58394,0,-11000,11000,-5309,-1250,-1327,-3318,-3318,"2026-08-08","2026-08-12","45k08jq4q1","SPX Hemat"],
  ["260805JK0RM6RA",70000,55373,0,-3700,3700,-5040,-1250,-1260,-3150,-3150,"2026-08-05","2026-08-12","keolahijab","SPX Standard"],
  ["260803CVK11SG3",49499,38791,0,-6500,6500,-3564,-1250,-891,-2227,-2227,"2026-08-03","2026-08-12","faizalrahman1","Anteraja Reguler"],
  ["260808SVJG7GY0",48132,37684,0,-14000,14000,-3466,-1250,-866,-2166,-2166,"2026-08-08","2026-08-11","wan_91olshop","SPX Instant Prioritas"],
  ["260803BB46ECDY",49499,38791,0,-6500,6500,-3564,-1250,-891,-2227,-2227,"2026-08-03","2026-08-11","tataaaa911","SPX Standard"],
  ["260808R7H7G6XA",36867,28571,0,-6500,6500,-2654,-1250,-664,-1659,-1659,"2026-08-08","2026-08-10","luluk.maknunn","SPX Standard"],
  ["260806MM34RD13",50000,37695,0,-3500,3500,-5100,-1250,-900,-2250,-2250,"2026-08-06","2026-08-10","ivuzudeyr5","SPX Hemat"],
  ["260802AT6Q46KA",78400,56707,0,-19000,19000,-5645,-1250,-1411,-3528,-3528,"2026-08-02","2026-08-10","ichapanjaitan","SPX Instant"],
  ["260806N2933KR4",54862,43127,0,-6500,6500,-3950,-1250,-988,-2469,-2469,"2026-08-06","2026-08-09","obas9q3opr","SPX Standard"],
  ["260806ME3GJXR6",98998,78829,0,-8000,8000,-7128,-1250,-1782,-4455,-4455,"2026-08-06","2026-08-09","endawati224","SPX Standard"],
  ["260804G38JTPCX",41694,32477,0,-3500,3500,-3002,-1250,-750,-1876,-1876,"2026-08-04","2026-08-09","agussabun","SPX Hemat"],
  ["260807PNU56YED",41694,32477,0,-6500,6500,-3002,-1250,-750,-1876,-1876,"2026-08-07","2026-08-08","adeiraone","JNE Reguler"],
  ["260803D28C3Y5U",49499,36139,0,-6500,6500,-3564,-1250,-891,-2227,-2227,"2026-08-03","2026-08-07","indriasariin","SPX Standard"],
  ["260727RHCFGUG1",40788,31744,0,-3500,3500,-2937,-1250,-734,-1835,-1835,"2026-07-27","2026-08-06","q71l_bjtb_","SPX Hemat"],
  ["260803DDAW2H5U",49499,38791,0,-6500,6500,-3564,-1250,-891,-2227,-2227,"2026-08-03","2026-08-05","mohamadfauzan23","SPX Standard"],
  ["26080185MCXJ3B",98998,78829,0,-5000,5000,-7128,-1250,-1782,-4455,-4455,"2026-08-01","2026-08-05","endawati224","SPX Hemat"],
  ["26072912EGDH36",90000,67055,77000,-92000,15000,-6480,-1250,-1620,-4050,-4050,"2026-07-29","2026-08-05","esrinpuluhulawa110","SPX Standard"],
  ["260728SW584CTE",41694,31851,0,-3500,3500,-3002,-1250,-750,-2502,-1876,"2026-07-28","2026-08-05","nettyariningsih","SPX Hemat"],
  ["260727RHN6X7TP",49499,38791,0,-3500,3500,-3564,-1250,-891,-2227,-2227,"2026-07-27","2026-08-05","q71l_bjtb_","SPX Hemat"],
  ["260803DF8PXE3S",42750,33329,0,-10000,10000,-3078,-1250,-770,-1924,-1924,"2026-08-03","2026-08-04","adeiraone","SPX Instant Prioritas"],
  ["2607290R5MPX3W",49499,38791,0,-6500,6500,-3564,-1250,-891,-2227,-2227,"2026-07-29","2026-08-03","sukatmimul","SPX Standard"],
  ["260728U995BGK3",40788,28778,0,-6500,6500,-2937,-1250,-734,-2447,-1835,"2026-07-28","2026-08-03","adeiraone","SPX Standard"],
];

const wb = XLSX.utils.book_new();

// Summary
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
  ["Laporan Penghasilan"],
  ["Username (Penjual)","cbmajwastore"],
  ["Dari","2026-08-01"],
  ["ke","2026-08-31"],
  [],
  ["Ringkasan Penghasilan","","","Rp"],
  ["3. Total yang Dilepas","","",2776643]
]), 'Summary');

// Penghasilan - header di baris 3 (index 2)
const header = ['No.','Lihat berdasarkan','No. Pesanan','No. Pengajuan','ID Produk','Nama Produk','Waktu Pesanan Dibuat','Tanggal Dana Dilepaskan','Metode Pelepasan Dana','Tipe Pesanan','Total Penghasilan','Harga Produk','Jumlah Pengembalian Dana ke Pembeli','Ongkir Dibayar Pembeli','Ongkos Kirim yang Dibayarkan ke Jasa Kirim','Potongan Ongkos Kirim dari Jasa Kirim','Gratis Ongkir dari Shopee','Ongkos Kirim Pengembalian Barang','Return to Seller Fee','Pengembalian Biaya Kirim','Voucher disponsor oleh Penjual','Cashback Koin disponsori Penjual','Diskon Produk dari Shopee','Voucher co-fund disponsor oleh Penjual','Cashback Koin Co-fund disponsori Penjual','Biaya Administrasi (termasuk PPN 11%)','Biaya Proses Pesanan','Biaya Pembayaran','Biaya Gratis Ongkir XTRA - Ukuran Biasa (Kategori E)','Biaya Transaksi','Biaya Layanan Promo XTRA','Username (Pembeli)','Jasa Kirim'];
const penghasilanRows = [];
penghasilanRows.push(['Informasi Pesanan']);
penghasilanRows.push([]);
penghasilanRows.push(header);
orders.forEach((o,i)=>{
  const prod = produkMap[o[0]] || ['-','-'];
  penghasilanRows.push([i+1,'Order',o[0],'','-','-',o[11],o[12],'Saldo Penjual','Normal Order',o[2],o[1],0,o[3],o[4],0,o[5],0,0,0,0,0,0,0,0,o[6],o[7],o[8],o[9],0,o[10],o[13],o[14]]);
  penghasilanRows.push([i+1,'Sku',o[0],'-',prod[0],prod[1],o[11],o[12],'Saldo Penjual','Normal Order',o[2],o[1],0,o[3],o[4],0,o[5],0,0,0,0,0,0,0,0,o[6],o[7],o[8],o[9],0,o[10],'','']);
});
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(penghasilanRows), 'Penghasilan');

// Seller Fee
const feeHeader = ['No.','No. Pesanan','Biaya Platform','Biaya Gratis Ongkir XTRA','Biaya Layanan','Biaya Promosi','Biaya Lainnya'];
const feeRows = [feeHeader, ...orders.map((o,i)=>[i+1,o[0],o[6],o[9],o[10],0,0])];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[],...feeRows]), 'Seller Fee');

XLSX.writeFile(wb, 'data/Income.sudah dilepas.id.20260801_20260831.xlsx');
console.log('Replica Income file created with 59 orders, total 2.776.643');
