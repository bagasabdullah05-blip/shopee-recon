import { getHppMap } from './db.js';

export function hitungLaba(orders, hppMap = null) {
  if (!hppMap) hppMap = getHppMap();
  let totalPenghasilan = 0, totalHargaProduk = 0, totalHpp = 0, totalBebanShopeeAll = 0;
  let beban = { admin:0, proses:0, pembayaran:0, gratisOngkirXTRA:0, layananXTRA:0, kampanye:0, komisiAMS:0, isiSaldo:0, transaksi:0, premi:0, pph22:0, ongkirJasa:0, gratisOngkirShopee:0, ongkirPengembalian:0 };
  const perProduk = new Map();
  const detail = orders.map(o => {
    const hpp = hppMap.get(o.idProduk?.split(',')[0]) ?? hppMap.get(o.namaProduk) ?? 0;
    const bebanHpp = hpp;
    const bAdmin = Math.abs(o.biayaAdmin||0), bProses = Math.abs(o.biayaProses||0), bBayar = Math.abs(o.biayaPembayaran||0);
    const bGratisXTRA = Math.abs(o.biayaGratisOngkirXTRA||0), bLayananXTRA = Math.abs(o.biayaLayananPromoXTRA||0);
    const bKampanye = Math.abs(o.biayaKampanye||0), bKomisiAMS = Math.abs(o.biayaKomisiAMS||0), bIsiSaldo = Math.abs(o.biayaIsiSaldo||0);
    const bTransaksi = Math.abs(o.biayaTransaksi||0), bPremi = Math.abs(o.premi||0), bPph = Math.abs(o.pph22||0);
    const bOngkirJasa = Math.abs(o.ongkosKirimKeJasa||0), bGratisOngkir = Math.abs(o.gratisOngkirShopee||0), bOngkirKembali = Math.abs(o.ongkirPengembalian||0);
    const bebanShopee = bAdmin + bProses + bBayar + bGratisXTRA + bLayananXTRA + bKampanye + bKomisiAMS + bIsiSaldo + bTransaksi + bPremi;
    const laba = o.totalPenghasilan - bebanHpp;

    totalPenghasilan += o.totalPenghasilan;
    totalHargaProduk += o.hargaProduk;
    totalHpp += bebanHpp;
    totalBebanShopeeAll += bebanShopee;
    beban.admin+=bAdmin; beban.proses+=bProses; beban.pembayaran+=bBayar; beban.gratisOngkirXTRA+=bGratisXTRA; beban.layananXTRA+=bLayananXTRA;
    beban.kampanye+=bKampanye; beban.komisiAMS+=bKomisiAMS; beban.isiSaldo+=bIsiSaldo; beban.transaksi+=bTransaksi; beban.premi+=bPremi; beban.pph22+=bPph;
    beban.ongkirJasa+=bOngkirJasa; beban.gratisOngkirShopee+=bGratisOngkir; beban.ongkirPengembalian+=bOngkirKembali;

    if (!perProduk.has(o.namaProduk)) perProduk.set(o.namaProduk, { count:0, penghasilan:0, hpp:0, laba:0 });
    const pp = perProduk.get(o.namaProduk);
    pp.count++; pp.penghasilan+=o.totalPenghasilan; pp.hpp+=bebanHpp; pp.laba+=laba;

    return { ...o, hpp: bebanHpp, bebanShopee, laba, margin: o.totalPenghasilan ? (laba/o.totalPenghasilan*100).toFixed(1)+'%' : '0%' };
  });

  const labaBersih = totalPenghasilan - totalHpp;
  const marginBersih = totalPenghasilan ? (labaBersih/totalPenghasilan*100).toFixed(1) : 0;
  const bebanAffiliate = beban.komisiAMS + beban.kampanye;
  const bebanGratisOngkir = beban.gratisOngkirXTRA;
  const bebanLayanan = beban.layananXTRA;
  const bebanPlatform = beban.admin + beban.proses + beban.pembayaran + beban.transaksi;
  return {
    ringkasan: { totalPenghasilan, totalHargaProduk, totalHpp, totalBebanShopee: totalBebanShopeeAll, labaBersih, marginBersih: marginBersih+'%', totalOrder: orders.length, beban, bebanAffiliate, bebanGratisOngkir, bebanLayanan, bebanPlatform, totalBebanShopeeAll },
    perProduk: Array.from(perProduk.entries()).map(([nama,v])=>({ nama, ...v, margin: v.penghasilan? (v.laba/v.penghasilan*100).toFixed(1)+'%':'0%' })).sort((a,b)=>b.laba-a.laba),
    detail
  };
}
