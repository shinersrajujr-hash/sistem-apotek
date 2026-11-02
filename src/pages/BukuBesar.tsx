import { useMemo, useState } from 'react';
import {
  BookOpen, TrendingUp, TrendingDown, Scale, Download,
  Calendar, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatRupiah, formatTanggal, formatTanggalShort, toDateInput } from '@/lib/format';

// ─── Tipe Lokal ───────────────────────────────────────────────────────────────

type JenisAkun =
  | 'Kas'
  | 'Piutang Usaha'
  | 'Persediaan Obat'
  | 'Pendapatan Penjualan'
  | 'Harga Pokok Penjualan'
  | 'PPN Keluaran'
  | 'Beban Pembelian'
  | 'Penyesuaian Stok';

interface JurnalEntry {
  id: string;
  tanggal: string;
  nomorReferensi: string;
  keterangan: string;
  akun: JenisAkun;
  debit: number;
  kredit: number;
}

type Period = 'hari' | '7hari' | 'bulan' | 'custom';

// ─── Warna per akun ───────────────────────────────────────────────────────────
const akunColor: Record<JenisAkun, string> = {
  'Kas':                    'bg-teal-50 text-teal-700 border-teal-200',
  'Piutang Usaha':          'bg-blue-50 text-blue-700 border-blue-200',
  'Persediaan Obat':        'bg-purple-50 text-purple-700 border-purple-200',
  'Pendapatan Penjualan':   'bg-green-50 text-green-700 border-green-200',
  'Harga Pokok Penjualan':  'bg-orange-50 text-orange-700 border-orange-200',
  'PPN Keluaran':           'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Beban Pembelian':        'bg-red-50 text-red-700 border-red-200',
  'Penyesuaian Stok':       'bg-gray-50 text-gray-700 border-gray-200',
};

// ─── Komponen ─────────────────────────────────────────────────────────────────
export default function BukuBesar() {
  const { sales, stockActivities, medicines } = useApp();

  const today = new Date();
  const [period, setPeriod] = useState<Period>('bulan');
  const [customStart, setCustomStart] = useState(
    toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [customEnd, setCustomEnd] = useState(toDateInput(today));
  const [filterAkun, setFilterAkun] = useState<JenisAkun | ''>('');
  const [search, setSearch] = useState('');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  // ── Filter Tanggal ──────────────────────────────────────────────────────────
  const { dateStart, dateEnd } = useMemo(() => {
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    if (period === 'hari') {
      const start = new Date(today); start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    }
    if (period === '7hari') {
      const start = new Date(today); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    }
    if (period === 'bulan') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
      return { dateStart: start, dateEnd: end };
    }
    // custom
    return {
      dateStart: new Date(customStart + 'T00:00:00'),
      dateEnd:   new Date(customEnd   + 'T23:59:59'),
    };
  }, [period, customStart, customEnd]);

  // ── Bangun entri jurnal dari data sales ─────────────────────────────────────
  const jurnalEntries = useMemo(() => {
    const entries: JurnalEntry[] = [];

    // ── Dari penjualan (Sales) ────────────────────────────────────────────────
    sales
      .filter((s) => {
        const d = new Date(s.tanggal);
        return d >= dateStart && d <= dateEnd;
      })
      .forEach((sale) => {
        const subtotalBersih = sale.total - sale.pajakAmount;

        // 1. Debit: Kas / Piutang (sesuai metode pembayaran)
        const akunKas: JenisAkun =
          sale.metodePembayaran === 'Kredit' ? 'Piutang Usaha' : 'Kas';

        entries.push({
          id:               `${sale.id}-kas`,
          tanggal:          sale.tanggal,
          nomorReferensi:   sale.invoice,
          keterangan:       `Penerimaan kas - ${sale.invoice} (${sale.metodePembayaran})`,
          akun:             akunKas,
          debit:            sale.total,
          kredit:           0,
        });

        // 2. Kredit: Pendapatan Penjualan
        entries.push({
          id:               `${sale.id}-pend`,
          tanggal:          sale.tanggal,
          nomorReferensi:   sale.invoice,
          keterangan:       `Pendapatan penjualan - ${sale.invoice}`,
          akun:             'Pendapatan Penjualan',
          debit:            0,
          kredit:           subtotalBersih,
        });

        // 3. Kredit: PPN Keluaran (jika ada pajak)
        if (sale.pajakAmount > 0) {
          entries.push({
            id:             `${sale.id}-ppn`,
            tanggal:        sale.tanggal,
            nomorReferensi: sale.invoice,
            keterangan:     `PPN Keluaran ${sale.pajakPersen}% - ${sale.invoice}`,
            akun:           'PPN Keluaran',
            debit:          0,
            kredit:         sale.pajakAmount,
          });
        }

        // 4. Debit: HPP, Kredit: Persediaan Obat
        sale.items.forEach((item) => {
          const med = medicines.find((m) => m.id === item.medicineId);
          if (!med) return;
          const hpp = item.qty * med.hargaBeli;
          if (hpp === 0) return;

          entries.push({
            id:             `${sale.id}-hpp-${item.medicineId}`,
            tanggal:        sale.tanggal,
            nomorReferensi: sale.invoice,
            keterangan:     `HPP ${item.nama} (${item.qty} × ${formatRupiah(med.hargaBeli)})`,
            akun:           'Harga Pokok Penjualan',
            debit:          hpp,
            kredit:         0,
          });

          entries.push({
            id:             `${sale.id}-pers-${item.medicineId}`,
            tanggal:        sale.tanggal,
            nomorReferensi: sale.invoice,
            keterangan:     `Pengurangan persediaan ${item.nama}`,
            akun:           'Persediaan Obat',
            debit:          0,
            kredit:         hpp,
          });
        });
      });

    // ── Dari pergerakan stok (masuk & penyesuaian) ──────────────────────────
    stockActivities
      .filter((a) => {
        const d = new Date(a.tanggal);
        return d >= dateStart && d <= dateEnd;
      })
      .forEach((act) => {
        const med = medicines.find((m) => m.id === act.medicineId);
        if (!med) return;

        if (act.jenis === 'masuk') {
          const nilaiPembelian = act.jumlah * med.hargaBeli;

          // Debit: Persediaan Obat
          entries.push({
            id:             `${act.id}-pers`,
            tanggal:        act.tanggal,
            nomorReferensi: act.id,
            keterangan:     `Pembelian stok ${act.namaObat} (${act.jumlah} unit) - ${act.keterangan}`,
            akun:           'Persediaan Obat',
            debit:          nilaiPembelian,
            kredit:         0,
          });

          // Kredit: Beban Pembelian (hutang dagang / kas keluar)
          entries.push({
            id:             `${act.id}-beli`,
            tanggal:        act.tanggal,
            nomorReferensi: act.id,
            keterangan:     `Pembayaran pembelian ${act.namaObat} - ${act.keterangan}`,
            akun:           'Beban Pembelian',
            debit:          0,
            kredit:         nilaiPembelian,
          });
        }

        if (act.jenis === 'penyesuaian' && act.jumlah !== 0) {
          const nilaiPenyesuaian = Math.abs(act.jumlah) * med.hargaBeli;
          const pengurangan = act.jumlah < 0;

          entries.push({
            id:             `${act.id}-adj`,
            tanggal:        act.tanggal,
            nomorReferensi: act.id,
            keterangan:     `Penyesuaian stok ${act.namaObat}: ${act.jumlah > 0 ? '+' : ''}${act.jumlah} unit - ${act.keterangan}`,
            akun:           'Penyesuaian Stok',
            debit:          pengurangan ? nilaiPenyesuaian : 0,
            kredit:         pengurangan ? 0 : nilaiPenyesuaian,
          });
        }
      });

    // Urutkan berdasarkan tanggal terbaru
    return entries.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
    );
  }, [sales, stockActivities, medicines, dateStart, dateEnd]);

  // ── Filter akun & pencarian ─────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    return jurnalEntries.filter((e) => {
      const matchAkun   = !filterAkun || e.akun === filterAkun;
      const matchSearch = !search ||
        e.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        e.nomorReferensi.toLowerCase().includes(search.toLowerCase());
      return matchAkun && matchSearch;
    });
  }, [jurnalEntries, filterAkun, search]);

  // ── Ringkasan per akun ──────────────────────────────────────────────────────
  const ringkasan = useMemo(() => {
    const totalDebit     = jurnalEntries.reduce((s, e) => s + e.debit, 0);
    const totalKredit    = jurnalEntries.reduce((s, e) => s + e.kredit, 0);
    const totalPendapatan = jurnalEntries
      .filter((e) => e.akun === 'Pendapatan Penjualan')
      .reduce((s, e) => s + e.kredit, 0);
    const totalHPP       = jurnalEntries
      .filter((e) => e.akun === 'Harga Pokok Penjualan')
      .reduce((s, e) => s + e.debit, 0);
    const labaKotor      = totalPendapatan - totalHPP;
    const totalPajak     = jurnalEntries
      .filter((e) => e.akun === 'PPN Keluaran')
      .reduce((s, e) => s + e.kredit, 0);
    const totalPembelian = jurnalEntries
      .filter((e) => e.akun === 'Beban Pembelian')
      .reduce((s, e) => s + e.kredit, 0);

    return { totalDebit, totalKredit, totalPendapatan, totalHPP, labaKotor, totalPajak, totalPembelian };
  }, [jurnalEntries]);

  // ── Saldo berjalan ─────────────────────────────────────────────────────────
  const entriesWithSaldo = useMemo(() => {
    let saldo = 0;
    // Hitung dari yang terlama ke terbaru untuk saldo berjalan yang benar
    const ordered = [...filteredEntries].reverse();
    const result = ordered.map((e) => {
      saldo += e.debit - e.kredit;
      return { ...e, saldo };
    });
    return result.reverse();
  }, [filteredEntries]);

  // ── Ekspor CSV ─────────────────────────────────────────────────────────────
  function exportCSV() {
    const header = 'Tanggal,Referensi,Keterangan,Akun,Debit,Kredit,Saldo\n';
    const rows = entriesWithSaldo
      .map((e) =>
        `${formatTanggalShort(e.tanggal)},"${e.nomorReferensi}","${e.keterangan}",${e.akun},${e.debit},${e.kredit},${e.saldo}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `buku-besar-${toDateInput(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Kumpulan referensi untuk expand/collapse detail
  const refGroups = useMemo(() => {
    const map = new Map<string, JurnalEntry[]>();
    jurnalEntries.forEach((e) => {
      const arr = map.get(e.nomorReferensi) ?? [];
      arr.push(e);
      map.set(e.nomorReferensi, arr);
    });
    return map;
  }, [jurnalEntries]);

  const allAkun: JenisAkun[] = [
    'Kas', 'Piutang Usaha', 'Persediaan Obat',
    'Pendapatan Penjualan', 'Harga Pokok Penjualan',
    'PPN Keluaran', 'Beban Pembelian', 'Penyesuaian Stok',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4" />
            Periode:
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { key: 'hari'   as Period, label: 'Hari Ini' },
              { key: '7hari'  as Period, label: '7 Hari' },
              { key: 'bulan'  as Period, label: 'Bulan Ini' },
              { key: 'custom' as Period, label: 'Custom' },
            ]).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input w-auto" />
              <span className="text-gray-400">—</span>
              <input type="date" value={customEnd}   onChange={(e) => setCustomEnd(e.target.value)}   className="input w-auto" />
            </div>
          )}
          <button
            onClick={exportCSV}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* ── Kartu Ringkasan ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-xs text-gray-400">Total Pendapatan</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{formatRupiah(ringkasan.totalPendapatan)}</p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-xs text-gray-400">Harga Pokok Penjualan</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{formatRupiah(ringkasan.totalHPP)}</p>
        </div>
        <div className="card p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${ringkasan.labaKotor >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <Scale className={`w-5 h-5 ${ringkasan.labaKotor >= 0 ? 'text-green-600' : 'text-red-500'}`} />
          </div>
          <p className="text-xs text-gray-400">Laba Kotor</p>
          <p className={`text-xl font-bold mt-0.5 ${ringkasan.labaKotor >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatRupiah(ringkasan.labaKotor)}
          </p>
        </div>
        <div className="card p-5">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-xs text-gray-400">Beban Pembelian</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{formatRupiah(ringkasan.totalPembelian)}</p>
        </div>
      </div>

      {/* ── Neraca Saldo Ringkas ─────────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Neraca Saldo</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">Nama Akun</th>
                <th className="pb-3 font-semibold text-right">Total Debit</th>
                <th className="pb-3 font-semibold text-right">Total Kredit</th>
                <th className="pb-3 font-semibold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allAkun.map((akun) => {
                const debit  = jurnalEntries.filter((e) => e.akun === akun).reduce((s, e) => s + e.debit,  0);
                const kredit = jurnalEntries.filter((e) => e.akun === akun).reduce((s, e) => s + e.kredit, 0);
                const saldo  = debit - kredit;
                if (debit === 0 && kredit === 0) return null;
                return (
                  <tr key={akun} className="hover:bg-gray-50/50">
                    <td className="py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${akunColor[akun]}`}>
                        {akun}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-right text-gray-700">{debit  > 0 ? formatRupiah(debit)  : '—'}</td>
                    <td className="py-3 text-sm text-right text-gray-700">{kredit > 0 ? formatRupiah(kredit) : '—'}</td>
                    <td className={`py-3 text-sm font-semibold text-right ${saldo >= 0 ? 'text-teal-700' : 'text-red-600'}`}>
                      {formatRupiah(Math.abs(saldo))} {saldo < 0 ? '(K)' : '(D)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 text-sm font-bold text-gray-900">Total</td>
                <td className="py-3 text-sm font-bold text-right text-gray-900">{formatRupiah(ringkasan.totalDebit)}</td>
                <td className="py-3 text-sm font-bold text-right text-gray-900">{formatRupiah(ringkasan.totalKredit)}</td>
                <td className="py-3 text-sm font-bold text-right text-gray-500 text-xs">
                  {ringkasan.totalDebit === ringkasan.totalKredit
                    ? '✓ Seimbang'
                    : `Selisih: ${formatRupiah(Math.abs(ringkasan.totalDebit - ringkasan.totalKredit))}`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Jurnal Umum ─────────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-gray-900">Jurnal Umum</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filteredEntries.length} entri</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari keterangan / referensi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 w-56"
              />
            </div>
            {/* Filter Akun */}
            <select
              value={filterAkun}
              onChange={(e) => setFilterAkun(e.target.value as JenisAkun | '')}
              className="input w-auto"
            >
              <option value="">Semua Akun</option>
              {allAkun.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Referensi</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 font-semibold">Akun</th>
                <th className="px-4 py-3 font-semibold text-right">Debit</th>
                <th className="px-4 py-3 font-semibold text-right">Kredit</th>
                <th className="px-4 py-3 font-semibold text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entriesWithSaldo.map((entry) => {
                const isGroup  = refGroups.has(entry.nomorReferensi);
                const expanded = expandedRef === entry.nomorReferensi;
                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatTanggalShort(entry.tanggal)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedRef(expanded ? null : entry.nomorReferensi)}
                        className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 whitespace-nowrap"
                      >
                        {entry.nomorReferensi}
                        {isGroup && (
                          expanded
                            ? <ChevronUp   className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                      <p className="truncate">{entry.keterangan}</p>
                      {/* Detail jurnal dari referensi yang sama jika expand */}
                      {expanded && (
                        <div className="mt-2 space-y-1 border-l-2 border-teal-200 pl-3">
                          {(refGroups.get(entry.nomorReferensi) ?? [])
                            .filter((e) => e.id !== entry.id)
                            .map((e) => (
                              <p key={e.id} className="text-xs text-gray-500">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium mr-1 ${akunColor[e.akun]}`}>
                                  {e.akun}
                                </span>
                                {e.debit > 0
                                  ? `D: ${formatRupiah(e.debit)}`
                                  : `K: ${formatRupiah(e.kredit)}`}
                              </p>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${akunColor[entry.akun]}`}>
                        {entry.akun}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-teal-700">
                      {entry.debit > 0 ? formatRupiah(entry.debit) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      {entry.kredit > 0 ? formatRupiah(entry.kredit) : '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${
                      entry.saldo >= 0 ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {formatRupiah(Math.abs(entry.saldo))}
                      <span className="text-xs text-gray-400 ml-0.5">
                        {entry.saldo >= 0 ? 'D' : 'K'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {entriesWithSaldo.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Tidak ada entri jurnal pada periode ini</p>
                  </td>
                </tr>
              )}
            </tbody>
            {/* Footer total */}
            {entriesWithSaldo.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-teal-700">
                    {formatRupiah(filteredEntries.reduce((s, e) => s + e.debit, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-red-600">
                    {formatRupiah(filteredEntries.reduce((s, e) => s + e.kredit, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-gray-500">
                    —
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Ringkasan Laba Rugi ──────────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Ringkasan Laba Rugi</h3>
        <div className="max-w-md space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pendapatan Penjualan</span>
            <span className="font-semibold text-gray-900">{formatRupiah(ringkasan.totalPendapatan)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Harga Pokok Penjualan (HPP)</span>
            <span className="font-semibold text-red-600">({formatRupiah(ringkasan.totalHPP)})</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-3">
            <span className="text-gray-700">Laba Kotor</span>
            <span className={ringkasan.labaKotor >= 0 ? 'text-teal-700' : 'text-red-600'}>
              {formatRupiah(ringkasan.labaKotor)}
            </span>
          </div>
          {ringkasan.totalPembelian > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Beban Pembelian Stok</span>
              <span className="font-semibold text-red-600">({formatRupiah(ringkasan.totalPembelian)})</span>
            </div>
          )}
          {ringkasan.totalPajak > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">PPN Keluaran</span>
              <span className="font-semibold text-yellow-700">({formatRupiah(ringkasan.totalPajak)})</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 pt-3">
            <span className="text-gray-900">Laba Bersih</span>
            <span className={ringkasan.labaKotor - ringkasan.totalPembelian >= 0 ? 'text-teal-700' : 'text-red-600'}>
              {formatRupiah(ringkasan.labaKotor - ringkasan.totalPembelian)}
            </span>
          </div>
          {/* Tanggal cetak */}
          <p className="text-xs text-gray-400 pt-1">
            Per {formatTanggal(new Date().toISOString())}
          </p>
        </div>
      </div>

    </div>
  );
}
