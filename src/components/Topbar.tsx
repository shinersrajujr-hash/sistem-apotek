import { useEffect, useRef, useState } from 'react';
import { Bell, Search, Menu, Pill, Receipt, X, AlertTriangle, ChevronRight, Wifi, WifiOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatRupiah, getStockStatus } from '@/lib/format';
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

export default function Topbar({ page, onOpenMobile, onNavigate }: TopbarProps) {
  const { medicines, sales, settings, syncStatus } = useApp();
  const stokMinimum = settings.transaksi.stokMinimum;
  const adminNama = settings.admin.nama;
  const adminRole = settings.admin.role;

  const { title, subtitle } = pageTitles[page];

  // ── Global Search ──────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = (() => {
    if (!query.trim() || query.length < 2) return { medicines: [], sales: [] };
    const q = query.toLowerCase();
    return {
      medicines: medicines
        .filter(
          (m) =>
            m.nama.toLowerCase().includes(q) ||
            m.kategori.toLowerCase().includes(q),
        )
        .slice(0, 5),
      sales: sales
        .filter(
          (s) =>
            s.invoice.toLowerCase().includes(q) ||
            s.metodePembayaran.toLowerCase().includes(q),
        )
        .slice(0, 3),
    };
  })();

  const hasResults =
    searchResults.medicines.length > 0 || searchResults.sales.length > 0;
  const showDropdown = searchOpen && query.length >= 2;

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSearchNavigate(dest: PageKey) {
    setQuery('');
    setSearchOpen(false);
    onNavigate(dest);
  }

  // ── Notifikasi Stok ────────────────────────────────────────────────────
  const lowStockMeds = medicines.filter(
    (m) => getStockStatus(m.stok, stokMinimum) !== 'tersedia',
  );
  const notifCount = lowStockMeds.length;
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Inisial nama admin
  const initials = adminNama
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'A';

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-8 h-16">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">{title}</h2>
            <p className="text-xs text-gray-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Right: search + bell + avatar */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">

          {/* ── Global Search ── */}
          <div ref={searchRef} className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari obat, invoice..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-56 lg:w-72 pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown hasil pencarian */}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                {!hasResults ? (
                  <div className="p-4 text-center">
                    <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Tidak ada hasil untuk "{query}"</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {/* Obat */}
                    {searchResults.medicines.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Obat
                          </p>
                        </div>
                        {searchResults.medicines.map((m) => {
                          const status = getStockStatus(m.stok, stokMinimum);
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleSearchNavigate('obat')}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Pill className="w-4 h-4 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {m.nama}
                                </p>
                                <p className="text-xs text-gray-400">{m.kategori}</p>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs font-semibold text-teal-700">
                                  {formatRupiah(m.hargaJual)}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 ${
                                    status === 'tersedia'
                                      ? 'text-green-600'
                                      : status === 'menipis'
                                      ? 'text-amber-600'
                                      : 'text-red-500'
                                  }`}
                                >
                                  Stok: {m.stok}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Transaksi */}
                    {searchResults.sales.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 border-t border-t-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Transaksi
                          </p>
                        </div>
                        {searchResults.sales.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleSearchNavigate('laporan')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Receipt className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {s.invoice}
                              </p>
                              <p className="text-xs text-gray-400">
                                {s.metodePembayaran} · {s.items.length} item
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                              {formatRupiah(s.total)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Footer shortcut */}
                    <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">Tekan Enter untuk lihat semua</p>
                      <kbd className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        ESC
                      </kbd>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sync Status Badge ── */}
          <div className="hidden sm:flex items-center">
            {syncStatus === 'loading' && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sinkronisasi...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Tersinkron
              </span>
            )}
            {syncStatus === 'offline' && (
              <span
                className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full cursor-help"
                title="Tidak dapat terhubung ke Supabase. Data disimpan lokal."
              >
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
          </div>

          {/* ── Notifikasi Bell ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold leading-none">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                </span>
              )}
            </button>

            {/* Dropdown notifikasi */}
            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
                  {notifCount > 0 && (
                    <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                      {notifCount} baru
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="max-h-72 overflow-y-auto">
                  {notifCount === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div>
                      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-semibold text-amber-700">
                            {notifCount} obat perlu perhatian stok
                          </p>
                        </div>
                      </div>
                      {lowStockMeds.slice(0, 8).map((m) => {
                        const status = getStockStatus(m.stok, stokMinimum);
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              setNotifOpen(false);
                              onNavigate('stok');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                status === 'habis'
                                  ? 'bg-red-50'
                                  : 'bg-amber-50'
                              }`}
                            >
                              <Pill
                                className={`w-4 h-4 ${
                                  status === 'habis' ? 'text-red-500' : 'text-amber-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {m.nama}
                              </p>
                              <p className="text-xs text-gray-400">{m.kategori}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p
                                className={`text-xs font-semibold ${
                                  status === 'habis' ? 'text-red-500' : 'text-amber-600'
                                }`}
                              >
                                {status === 'habis' ? 'Habis' : `Sisa ${m.stok}`}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      {notifCount > 8 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          +{notifCount - 8} lainnya
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-2">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate('stok');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    Lihat semua stok
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Avatar Admin ── */}
          <div className="flex items-center gap-2.5 pl-2 lg:pl-3 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{adminNama}</p>
              <p className="text-xs text-gray-400">{adminRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
