import { getHppMap } from './db.js';

export function hitungLaba(orders, hppMap = null, manualBebanTotal = 0) {
  if (!hppMap) hppMap = getHppMap();
  let totalPenghasilan = 0, totalHargaProduk = 0, totalHpp = 0, totalBebanShopeeAll = 0, totalOngkirBersih = 0;
  let beban = { admin:0, proses:0, pembayaran:0, gratisOngkirXTRA:0, layananXTRA:0, kampanye:0, komisiAMS:0, isiSaldo:0, transaksi:0, premi:0, pph22:0, ongkirJasa:0, gratisOngkirShopee:0, ongkirBersih:0, ongkirPengembalian:0 };
  const perProduk = new Map();
  const detail = orders.map(o => {
    const hpp = hppMap.get(o.idProduk?.split(',')[0]) ?? hppMap.get(o.namaProduk) ?? 0;
    const bebanHpp = hpp;
    const bAdmin = Math.abs(o.biayaAdmin||0), bProses = Math.abs(o.biayaProses||0), bBayar = Math.abs(o.biayaPembayaran||0);
    const bGratisXTRA = Math.abs(o.biayaGratisOngkirXTRA||0), bLayananXTRA = Math.abs(o.biayaLayananPromoXTRA||0);
    const bKampanye = Math.abs(o.biayaKampanye||0), bKomisiAMS = Math.abs(o.biayaKomisiAMS||0), bIsiSaldo = Math.abs(o.biayaIsiSaldo||0);
    const bTransaksi = Math.abs(o.biayaTransaksi||0), bPremi = Math.abs(o.premi||0), bPph = Math.abs(o.pph22||0);
    const bOngkirJasa = Math.abs(o.ongkosKirimKeJasa||0), bGratisOngkir = Math.abs(o.gratisOngkirShopee||0), bOngkirKembali = Math.abs(o.ongkirPengembalian||0);
    // FIX #1: gratis ongkir mengurangi ongkos kirim ke jasa kirim
    const bOngkirBersih = Math.max(0, bOngkirJasa - bGratisOngkir);
    const bebanShopee = bAdmin + bProses + bBayar + bGratisXTRA + bLayananXTRA + bKampanye + bKomisiAMS + bIsiSaldo + bTransaksi + bPremi;
    const laba = o.totalPenghasilan - bebanHpp;

    totalPenghasilan += o.totalPenghasilan;
    totalHargaProduk += o.hargaProduk;
    totalHpp += bebanHpp;
    totalBebanShopeeAll += bebanShopee;
    totalOngkirBersih += bOngkirBersih;
    beban.admin+=bAdmin; beban.proses+=bProses; beban.pembayaran+=bBayar; beban.gratisOngkirXTRA+=bGratisXTRA; beban.layananXTRA+=bLayananXTRA;
    beban.kampanye+=bKampanye; beban.komisiAMS+=bKomisiAMS; beban.isiSaldo+=bIsiSaldo; beban.transaksi+=bTransaksi; beban.premi+=bPremi; beban.pph22+=bPph;
    beban.ongkirJasa+=bOngkirJasa; beban.gratisOngkirShopee+=bGratisOngkir; beban.ongkirBersih+=bOngkirBersih; beban.ongkirPengembalian+=bOngkirKembali;

    if (!perProduk.has(o.namaProduk)) perProduk.set(o.namaProduk, { count:0, penghasilan:0, subtotal:0, hpp:0, laba:0 });
    const pp = perProduk.get(o.namaProduk);
    pp.count++; pp.penghasilan+=o.totalPenghasilan; pp.subtotal+=o.hargaProduk; pp.hpp+=bebanHpp; pp.laba+=laba;

    return { ...o, hpp: bebanHpp, bebanShopee, ongkirBersih: bOngkirBersih, laba, margin: o.hargaProduk ? (laba/o.hargaProduk*100).toFixed(1)+'%' : '0%' };
  });

  // FIX #3: total pesanan (subtotal) ditampilkan terpisah; laba bersih = penghasilan - HPP - beban manual - ongkir bersih (opsional, tapi sesuai permintaan net)
  // Untuk menjaga kompatibilitas, labaKotor = penghasilan - HPP, labaBersih = labaKotor - manual (ongkir bersih ditampilkan terpisah, tidak mengurangi laba lagi karena sudah termasuk di penghasilan)
  // Jika ingin laba final setelah ongkir, gunakan labaFinal = labaBersih - totalOngkirBersih
  const labaKotor = totalPenghasilan - totalHpp;
  const labaBersih = labaKotor - (manualBebanTotal||0);
  const labaFinal = labaBersih; // ongkir bersih sudah net, tidak double kurangi dari laba (hanya info). Ubah jika perlu: labaFinal = labaBersih - totalOngkirBersih
  const marginBersih = totalHargaProduk ? (labaBersih/totalHargaProduk*100).toFixed(1) : 0;
  const bebanAffiliate = beban.komisiAMS + beban.kampanye;
  const bebanGratisOngkir = beban.gratisOngkirXTRA;
  const bebanLayanan = beban.layananXTRA;
  const bebanPlatform = beban.admin + beban.proses + beban.pembayaran + beban.transaksi;
  return {
    ringkasan: { totalPenghasilan, totalHargaProduk, totalSubtotal: totalHargaProduk, totalHpp, totalBebanShopee: totalBebanShopeeAll, labaKotor, labaBersih, labaFinal, marginBersih: marginBersih+'%', totalOrder: orders.length, beban, totalOngkirBersih, totalManualBeban: manualBebanTotal||0, bebanAffiliate, bebanGratisOngkir, bebanLayanan, bebanPlatform, totalBebanShopeeAll },
    perProduk: Array.from(perProduk.entries()).map(([nama,v])=>({ nama, ...v, margin: v.subtotal? (v.laba/v.subtotal*100).toFixed(1)+'%':'0%' })).sort((a,b)=>b.laba-a.laba),
    detail
  };
}
