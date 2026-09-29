import {
  BarChart3, ShoppingCart, Pill, Boxes, Truck,
  FileText, Settings, X, Stethoscope, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { getStockStatus } from '@/lib/format';
import type { PageKey } from '@/types';

interface SidebarProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { key: PageKey; label: string; icon: typeof BarChart3 }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'penjualan', label: 'Penjualan', icon: ShoppingCart },
  { key: 'obat', label: 'Obat', icon: Pill },
  { key: 'stok', label: 'Stok', icon: Boxes },
  { key: 'supplier', label: 'Supplier', icon: Truck },
  { key: 'laporan', label: 'Laporan', icon: FileText },
  { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  const { medicines, settings } = useApp();
  const stokMinimum = settings.transaksi.stokMinimum;
  const apotekNama = settings.apotek.nama;

  // Badge: jumlah obat stok menipis/habis untuk menu Stok
  const lowStockCount = medicines.filter(
    (m) => getStockStatus(m.stok, stokMinimum) !== 'tersedia',
  ).length;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 text-sm leading-tight truncate">
                {apotekNama}
              </h1>
              <p className="text-xs text-gray-400">Sistem Manajemen</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            // Tampilkan badge stok di menu Stok dan Dashboard
            const badge =
              (item.key === 'stok' || item.key === 'dashboard') && lowStockCount > 0
                ? lowStockCount
                : 0;

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                )}
                {active && badge === 0 && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          {lowStockCount > 0 ? (
            <button
              onClick={() => onNavigate('stok')}
              className="w-full bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-4 text-left hover:from-amber-100 hover:to-amber-200/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-900">Perlu Restock</p>
              </div>
              <p className="text-xs text-amber-700">
                {lowStockCount} obat stok menipis atau habis
              </p>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-900">Semua stok aman</p>
              <p className="text-xs text-teal-700/80 mt-1">
                Tidak ada obat yang memerlukan restock saat ini.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
