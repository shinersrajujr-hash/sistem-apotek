import { Bell, Search, Menu } from 'lucide-react';
import type { PageKey } from '@/types';

const pageTitles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan aktivitas apotek hari ini' },
  penjualan: { title: 'Penjualan', subtitle: 'Buat dan kelola transaksi penjualan' },
  obat: { title: 'Obat', subtitle: 'Kelola data dan katalog obat' },
  stok: { title: 'Stok', subtitle: 'Pantau pergerakan stok obat' },
  supplier: { title: 'Supplier', subtitle: 'Kelola data supplier dan distribusi' },
  laporan: { title: 'Laporan', subtitle: 'Analisis pendapatan dan penjualan' },
  pengaturan: { title: 'Pengaturan', subtitle: 'Konfigurasi profil dan sistem' },
};

interface TopbarProps {
  page: PageKey;
  onOpenMobile: () => void;
  onNavigate: (page: PageKey) => void;
}

export default function Topbar({ page, onOpenMobile }: TopbarProps) {
  const { title, subtitle } = pageTitles[page];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMobile} className="lg:hidden text-gray-600 hover:text-gray-900">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{title}</h2>
            <p className="text-xs text-gray-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari obat, transaksi..."
              className="w-56 lg:w-72 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>

          <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 lg:pl-3 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-sm">
              AA
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">Admin Apotek</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
