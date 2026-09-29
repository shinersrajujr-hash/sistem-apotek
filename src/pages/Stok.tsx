import { useMemo, useState } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/Toast';
import { formatTanggalTime, formatRupiah } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { StockActivityType } from '@/types';

export default function Stok() {
  const { stockActivities, medicines, addStockActivity } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ medicineId: '', jenis: 'masuk' as StockActivityType, jumlah: 0, keterangan: '' });

  const filtered = useMemo(() => {
    return stockActivities.filter((a) => {
      const matchSearch = a.namaObat.toLowerCase().includes(search.toLowerCase());
      const matchJenis = !filterJenis || a.jenis === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [stockActivities, search, filterJenis]);

  const totalMasuk = stockActivities.filter((a) => a.jenis === 'masuk').reduce((s, a) => s + a.jumlah, 0);
  const totalKeluar = stockActivities.filter((a) => a.jenis === 'keluar').reduce((s, a) => s + a.jumlah, 0);
  const totalPenyesuaian = stockActivities.filter((a) => a.jenis === 'penyesuaian').reduce((s, a) => s + a.jumlah, 0);

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    const med = medicines.find((m) => m.id === adjustForm.medicineId);
    if (!med || !adjustForm.keterangan) {
      showToast('Lengkapi semua field', 'error');
      return;
    }
    addStockActivity({
      tanggal: new Date().toISOString(),
      medicineId: adjustForm.medicineId,
      namaObat: med.nama,
      jenis: adjustForm.jenis,
      jumlah: adjustForm.jumlah,
      keterangan: adjustForm.keterangan,
      user: 'Admin Apotek',
    });
    showToast('Stok berhasil disesuaikan');
    setAdjustModal(false);
    setAdjustForm({ medicineId: '', jenis: 'masuk', jumlah: 0, keterangan: '' });
  }

  const stats = [
    { label: 'Stok Masuk', value: `${totalMasuk} unit`, icon: ArrowDownLeft, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
    { label: 'Stok Keluar', value: `${totalKeluar} unit`, icon: ArrowUpRight, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
    { label: 'Penyesuaian', value: `${totalPenyesuaian >= 0 ? '+' : ''}${totalPenyesuaian} unit`, icon: SlidersHorizontal, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`card p-5 border ${s.border}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama obat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="input lg:w-48">
            <option value="">Semua Aktivitas</option>
            <option value="masuk">Stok Masuk</option>
            <option value="keluar">Stok Keluar</option>
            <option value="penyesuaian">Penyesuaian</option>
          </select>
          <button onClick={() => setAdjustModal(true)} className="btn-primary whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            Penyesuaian Stok
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                <th className="px-5 py-3.5 font-semibold">Nama Obat</th>
                <th className="px-5 py-3.5 font-semibold">Jenis</th>
                <th className="px-5 py-3.5 font-semibold text-center">Jumlah</th>
                <th className="px-5 py-3.5 font-semibold">Keterangan</th>
                <th className="px-5 py-3.5 font-semibold">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatTanggalTime(a.tanggal)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{a.namaObat}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.jenis} /></td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                      a.jenis === 'masuk' ? 'text-green-600' : a.jenis === 'keluar' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {a.jenis === 'masuk' ? <TrendingUp className="w-3.5 h-3.5" /> : a.jenis === 'keluar' ? <TrendingDown className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                      {a.jumlah > 0 ? '+' : ''}{a.jumlah}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{a.keterangan}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{a.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada aktivitas stok</p>
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      <Modal
        open={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="Penyesuaian Stok"
        description="Tambah, kurangi, atau sesuaikan stok obat"
      >
        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="label">Obat</label>
            <select className="input" value={adjustForm.medicineId} onChange={(e) => setAdjustForm({ ...adjustForm, medicineId: e.target.value })}>
              <option value="">Pilih obat</option>
              {medicines.map((m) => <option key={m.id} value={m.id}>{m.nama} (Stok: {m.stok})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Jenis Aktivitas</label>
              <select className="input" value={adjustForm.jenis} onChange={(e) => setAdjustForm({ ...adjustForm, jenis: e.target.value as StockActivityType })}>
                <option value="masuk">Stok Masuk</option>
                <option value="keluar">Stok Keluar</option>
                <option value="penyesuaian">Penyesuaian</option>
              </select>
            </div>
            <div>
              <label className="label">Jumlah</label>
              <input type="number" className="input" value={adjustForm.jumlah || ''} onChange={(e) => setAdjustForm({ ...adjustForm, jumlah: Number(e.target.value) })} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Keterangan</label>
            <textarea className="input min-h-[80px] resize-none" value={adjustForm.keterangan} onChange={(e) => setAdjustForm({ ...adjustForm, keterangan: e.target.value })} placeholder="Contoh: Pembelian dari supplier, stok rusak, dll." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAdjustModal(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
