import { useMemo, useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Package, Calendar, Download } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatRupiah, formatTanggalShort, formatTanggalTime, getStockStatus, toDateInput } from '@/lib/format';
import { computeRevenueLast7Days, computeTopMedicines } from '@/lib/data';
import RevenueChart from '@/components/RevenueChart';
import DonutChart from '@/components/DonutChart';
import StatusBadge from '@/components/StatusBadge';

type Period = 'hari' | '7hari' | 'bulan' | 'custom';

export default function Laporan() {
  const { sales, medicines, stockActivities, settings } = useApp();
  const stokMinimum = settings.transaksi.stokMinimum;

  const today = new Date();
  const [period, setPeriod] = useState<Period>('7hari');
  const [customStart, setCustomStart] = useState(
    toDateInput(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
  );
  const [customEnd, setCustomEnd] = useState(toDateInput(today));

  const filteredSales = useMemo(() => {
    const now = new Date(today);
    now.setHours(23, 59, 59, 999);

    if (period === 'hari') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      return sales.filter((s) => {
        const d = new Date(s.tanggal);
        return d >= start && d <= now;
      });
    }
    if (period === '7hari') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return sales.filter((s) => new Date(s.tanggal) >= start);
    }
    if (period === 'bulan') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
      return sales.filter((s) => new Date(s.tanggal) >= start);
    }
    // custom
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T23:59:59');
    return sales.filter((s) => {
      const d = new Date(s.tanggal);
      return d >= start && d <= end;
    });
  }, [sales, period, customStart, customEnd]);

  const totalPendapatan = filteredSales.reduce((s, t) => s + t.total, 0);
  const totalTransaksi = filteredSales.length;
  const totalItemTerjual = filteredSales.reduce(
    (s, t) => s + t.items.reduce((qs, i) => qs + i.qty, 0),
    0,
  );
  const avgTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;

  // Distribusi kategori (live dari medicines)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    medicines.forEach((m) => {
      map[m.kategori] = (map[m.kategori] ?? 0) + 1;
    });
    const colors = [
      '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
      '#10b981', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
    ];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], i) => ({ label, value, color: colors[i] }));
  }, [medicines]);

  // ── Obat Terlaris dihitung dari data penjualan NYATA ─────────────────────
  const topMedicines = useMemo(() => computeTopMedicines(filteredSales, 5), [filteredSales]);

  // ── Grafik pendapatan dihitung dari data penjualan NYATA ─────────────────
  const revenueChartData = useMemo(() => computeRevenueLast7Days(sales), [sales]);

  const stockMovement = stockActivities.slice(0, 8);

  const stats = [
    { label: 'Total Pendapatan', value: formatRupiah(totalPendapatan), icon: DollarSign, color: 'bg-teal-50 text-teal-600' },
    { label: 'Total Transaksi', value: String(totalTransaksi), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Item Terjual', value: String(totalItemTerjual), icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Rata-rata/Transaksi', value: formatRupiah(avgTransaksi), icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  // ── Ekspor CSV sederhana ─────────────────────────────────────────────────
  function exportCSV() {
    const header = 'Invoice,Tanggal,Item,Total,Metode Pembayaran,Kasir\n';
    const rows = filteredSales
      .map((s) =>
        `${s.invoice},${new Date(s.tanggal).toLocaleString('id-ID')},${s.items.length},${s.total},${s.metodePembayaran},${s.kasir}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${period}-${toDateInput(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Period Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4" />
            Periode:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'hari' as Period, label: 'Hari Ini' },
              { key: '7hari' as Period, label: '7 Hari' },
              { key: 'bulan' as Period, label: 'Bulan Ini' },
              { key: 'custom' as Period, label: 'Custom' },
            ].map((p) => (
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
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input w-auto"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input w-auto"
              />
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500 mt-4">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Grafik Pendapatan</h3>
              <p className="text-sm text-gray-400 mt-0.5">7 hari terakhir (data real)</p>
            </div>
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-1">Distribusi Kategori</h3>
          <p className="text-sm text-gray-400 mb-6">Komposisi obat per kategori</p>
          <DonutChart
            data={categoryData}
            centerLabel="Kategori"
            centerValue={String(categoryData.length)}
          />
        </div>
      </div>

      {/* Top Medicines + Stock Movement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Obat Terlaris — dihitung dari filteredSales */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Obat Terlaris</h3>
            <span className="text-xs text-gray-400">Periode terpilih</span>
          </div>
          {topMedicines.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Tidak ada data penjualan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topMedicines.map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i === 0
                        ? 'bg-amber-50 text-amber-600'
                        : i === 1
                        ? 'bg-gray-100 text-gray-500'
                        : i === 2
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.nama}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${(m.terjual / (topMedicines[0]?.terjual || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{m.terjual} pcs</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    {formatRupiah(m.pendapatan)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pergerakan Stok Terbaru */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Pergerakan Stok Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2.5 font-semibold">Tanggal</th>
                  <th className="pb-2.5 font-semibold">Obat</th>
                  <th className="pb-2.5 font-semibold">Jenis</th>
                  <th className="pb-2.5 font-semibold text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stockMovement.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatTanggalShort(a.tanggal)}
                    </td>
                    <td className="py-3 text-sm text-gray-700 max-w-[160px] truncate">
                      {a.namaObat}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={a.jenis} />
                    </td>
                    <td
                      className={`py-3 text-sm font-semibold text-right ${
                        a.jenis === 'masuk'
                          ? 'text-green-600'
                          : a.jenis === 'keluar'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {a.jumlah > 0 ? '+' : ''}{a.jumlah}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Riwayat Transaksi</h3>
          <span className="text-xs text-gray-400">{filteredSales.length} transaksi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">Invoice</th>
                <th className="pb-3 font-semibold">Waktu</th>
                <th className="pb-3 font-semibold">Item</th>
                <th className="pb-3 font-semibold">Pajak</th>
                <th className="pb-3 font-semibold">Metode</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="py-3 text-sm font-medium text-gray-900">{s.invoice}</td>
                  <td className="py-3 text-sm text-gray-500">{formatTanggalTime(s.tanggal)}</td>
                  <td className="py-3 text-sm text-gray-500">{s.items.length} item</td>
                  <td className="py-3 text-sm text-gray-500">
                    {s.pajakPersen > 0 ? `${s.pajakPersen}%` : '-'}
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      {s.metodePembayaran}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-gray-900 text-right">
                    {formatRupiah(s.total)}
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stok Menipis Summary */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          Ringkasan Stok Kritis
          <span className="ml-2 text-sm font-normal text-gray-400">
            (threshold: ≤ {stokMinimum} unit)
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">Nama Obat</th>
                <th className="pb-3 font-semibold">Kategori</th>
                <th className="pb-3 font-semibold text-center">Stok</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Expired</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {medicines
                .filter((m) => getStockStatus(m.stok, stokMinimum) !== 'tersedia')
                .map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="py-3 text-sm font-medium text-gray-900">{m.nama}</td>
                    <td className="py-3 text-sm text-gray-500">{m.kategori}</td>
                    <td className="py-3 text-sm text-center font-semibold text-gray-700">{m.stok}</td>
                    <td className="py-3">
                      <StatusBadge status={getStockStatus(m.stok, stokMinimum)} />
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {formatTanggalShort(m.expiredDate)}
                    </td>
                  </tr>
                ))}
              {medicines.filter((m) => getStockStatus(m.stok, stokMinimum) !== 'tersedia')
                .length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                    Semua stok dalam kondisi aman
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
