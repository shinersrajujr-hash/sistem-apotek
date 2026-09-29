import { useMemo } from 'react';
import {
  DollarSign, ShoppingBag, Pill, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Plus, Receipt, FileText, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatRupiah, formatTanggalTime, getStockStatus } from '@/lib/format';
import { computeRevenueLast7Days } from '@/lib/data';
import RevenueChart from '@/components/RevenueChart';
import StatusBadge from '@/components/StatusBadge';
import type { PageKey } from '@/types';

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
  onQuickAction: (page: PageKey) => void;
}

export default function Dashboard({ onNavigate, onQuickAction }: DashboardProps) {
  const { medicines, sales, settings } = useApp();
  const stokMinimum = settings.transaksi.stokMinimum;

  // Tanggal hari ini menggunakan new Date() — tidak lagi hardcoded
  const today = new Date();

  const todaySales = useMemo(
    () => sales.filter((s) => new Date(s.tanggal).toDateString() === today.toDateString()),
    [sales],
  );

  const yesterdaySales = useMemo(() => {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return sales.filter((s) => new Date(s.tanggal).toDateString() === yesterday.toDateString());
  }, [sales]);

  const totalPendapatanHariIni = todaySales.reduce((s, t) => s + t.total, 0);
  const totalPendapatanKemarin = yesterdaySales.reduce((s, t) => s + t.total, 0);

  const totalTransaksiHariIni = todaySales.length;
  const totalTransaksiKemarin = yesterdaySales.length;

  const totalJenisObat = medicines.length;
  const obatMenipis = medicines.filter((m) => getStockStatus(m.stok, stokMinimum) !== 'tersedia');

  // Hitung perubahan persentase pendapatan hari ini vs kemarin
  function calcChangePct(current: number, prev: number): { label: string; trend: 'up' | 'down' | 'neutral' } {
    if (prev === 0 && current === 0) return { label: '0%', trend: 'neutral' };
    if (prev === 0) return { label: '+100%', trend: 'up' };
    const pct = ((current - prev) / prev) * 100;
    const label = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
    return { label, trend: pct >= 0 ? 'up' : 'down' };
  }

  const pendapatanChange = calcChangePct(totalPendapatanHariIni, totalPendapatanKemarin);
  const transaksiChange = calcChangePct(totalTransaksiHariIni, totalTransaksiKemarin);

  const stats = [
    {
      label: 'Total Pendapatan Hari Ini',
      value: formatRupiah(totalPendapatanHariIni),
      icon: DollarSign,
      change: pendapatanChange.label,
      trend: pendapatanChange.trend === 'neutral' ? 'up' as const : pendapatanChange.trend,
      color: 'teal',
    },
    {
      label: 'Total Transaksi Hari Ini',
      value: String(totalTransaksiHariIni),
      icon: ShoppingBag,
      change: transaksiChange.label,
      trend: transaksiChange.trend === 'neutral' ? 'up' as const : transaksiChange.trend,
      color: 'blue',
    },
    {
      label: 'Total Jenis Obat',
      value: String(totalJenisObat),
      icon: Pill,
      change: `${totalJenisObat} jenis`,
      trend: 'up' as const,
      color: 'purple',
    },
    {
      label: 'Obat Stok Menipis',
      value: String(obatMenipis.length),
      icon: AlertTriangle,
      change: obatMenipis.length > 0 ? `${obatMenipis.length} perlu restock` : 'Semua aman',
      trend: obatMenipis.length > 0 ? 'down' as const : 'up' as const,
      color: 'amber',
    },
  ];

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  // Grafik pendapatan 7 hari dari data real
  const revenueData = useMemo(() => computeRevenueLast7Days(sales), [sales]);
  const recentSales = sales.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  s.trend === 'up' ? 'text-teal-600' : 'text-red-500'
                }`}>
                  {s.trend === 'up'
                    ? <ArrowUpRight className="w-3.5 h-3.5" />
                    : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {s.change}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tambah Obat', desc: 'Daftarkan obat baru', icon: Plus, page: 'obat' as PageKey, color: 'teal' },
          { label: 'Transaksi Baru', desc: 'Buat penjualan baru', icon: Receipt, page: 'penjualan' as PageKey, color: 'blue' },
          { label: 'Lihat Laporan', desc: 'Analisis penjualan', icon: FileText, page: 'laporan' as PageKey, color: 'purple' },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={() => onQuickAction(a.page)}
              className="card p-5 text-left hover:shadow-md hover:border-teal-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[a.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Pendapatan 7 Hari Terakhir</h3>
              <p className="text-sm text-gray-400 mt-0.5">Tren pendapatan harian</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-teal-600 font-semibold bg-teal-50 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              {formatRupiah(revenueData.reduce((s, d) => s + d.pendapatan, 0))}
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Stok Menipis</h3>
            <button
              onClick={() => onNavigate('stok')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Lihat semua
            </button>
          </div>
          <div className="space-y-3">
            {obatMenipis.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.nama}</p>
                  <p className="text-xs text-gray-400">{m.kategori}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">{m.stok}</span>
                  <StatusBadge status={getStockStatus(m.stok, stokMinimum)} />
                </div>
              </div>
            ))}
            {obatMenipis.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Semua stok aman</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
          <button
            onClick={() => onNavigate('penjualan')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Lihat semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3 font-semibold">Invoice</th>
                <th className="pb-3 font-semibold">Waktu</th>
                <th className="pb-3 font-semibold">Item</th>
                <th className="pb-3 font-semibold">Metode</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 text-sm font-medium text-gray-900">{s.invoice}</td>
                  <td className="py-3.5 text-sm text-gray-500">{formatTanggalTime(s.tanggal)}</td>
                  <td className="py-3.5 text-sm text-gray-500">{s.items.length} item</td>
                  <td className="py-3.5">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                      {s.metodePembayaran}
                    </span>
                  </td>
                  <td className="py-3.5 text-sm font-semibold text-gray-900 text-right">
                    {formatRupiah(s.total)}
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    Belum ada transaksi hari ini
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
