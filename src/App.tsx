import { useState } from 'react';
import { AppProvider } from '@/store/AppContext';
import { ToastProvider } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/pages/Dashboard';
import Penjualan from '@/pages/Penjualan';
import Obat from '@/pages/Obat';
import Stok from '@/pages/Stok';
import Supplier from '@/pages/Supplier';
import Laporan from '@/pages/Laporan';
import Pengaturan from '@/pages/Pengaturan';
import type { PageKey } from '@/types';

function AppContent() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(p: PageKey) {
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        current={page}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar page={page} onOpenMobile={() => setMobileOpen(true)} onNavigate={navigate} />
        <main className="flex-1 p-4 lg:p-8">
          {page === 'dashboard' && <Dashboard onNavigate={navigate} onQuickAction={navigate} />}
          {page === 'penjualan' && <Penjualan />}
          {page === 'obat' && <Obat />}
          {page === 'stok' && <Stok />}
          {page === 'supplier' && <Supplier />}
          {page === 'laporan' && <Laporan />}
          {page === 'pengaturan' && <Pengaturan />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
