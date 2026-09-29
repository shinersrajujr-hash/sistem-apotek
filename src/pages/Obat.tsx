import { useMemo, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Pill, Filter } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/Toast';
import { formatRupiah, formatTanggalShort, getStockStatus } from '@/lib/format';
import { medicineCategories } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { Medicine } from '@/types';

const emptyForm: Omit<Medicine, 'id'> = {
  nama: '',
  kategori: '',
  satuan: 'Tablet',
  hargaBeli: 0,
  hargaJual: 0,
  stok: 0,
  expiredDate: '',
  supplierId: '',
};

export default function Obat() {
  const { medicines, suppliers, addMedicine, updateMedicine, deleteMedicine } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Medicine, 'id'>>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Medicine | null>(null);

  const filtered = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !filterKategori || m.kategori === filterKategori;
      const matchStatus = !filterStatus || getStockStatus(m.stok) === filterStatus;
      return matchSearch && matchKategori && matchStatus;
    });
  }, [medicines, search, filterKategori, filterStatus]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(m: Medicine) {
    setForm({ ...m });
    setEditingId(m.id);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.kategori || !form.expiredDate) {
      showToast('Lengkapi semua field wajib', 'error');
      return;
    }
    if (editingId) {
      updateMedicine(editingId, form);
      showToast('Data obat berhasil diperbarui');
    } else {
      addMedicine(form);
      showToast('Obat baru berhasil ditambahkan');
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteMedicine(confirmDelete.id);
    showToast('Obat berhasil dihapus', 'info');
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-5 animate-fadeIn">
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
          <div className="flex gap-3">
            <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="input min-w-[160px]">
              <option value="">Semua Kategori</option>
              {medicineCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input min-w-[150px]">
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="menipis">Stok Menipis</option>
              <option value="habis">Habis</option>
            </select>
            <button onClick={openAdd} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Tambah Obat
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                <th className="px-5 py-3.5 font-semibold">Nama Obat</th>
                <th className="px-5 py-3.5 font-semibold">Kategori</th>
                <th className="px-5 py-3.5 font-semibold">Satuan</th>
                <th className="px-5 py-3.5 font-semibold text-right">Harga Beli</th>
                <th className="px-5 py-3.5 font-semibold text-right">Harga Jual</th>
                <th className="px-5 py-3.5 font-semibold text-center">Stok</th>
                <th className="px-5 py-3.5 font-semibold">Expired</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Pill className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.nama}</p>
                        <p className="text-xs text-gray-400">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{m.kategori}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{m.satuan}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{formatRupiah(m.hargaBeli)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 text-right">{formatRupiah(m.hargaJual)}</td>
                  <td className="px-5 py-3.5 text-sm text-center font-medium text-gray-700">{m.stok}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatTanggalShort(m.expiredDate)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={getStockStatus(m.stok)} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(m)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Tidak ada obat yang sesuai filter</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Menampilkan {filtered.length} dari {medicines.length} obat</span>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Obat' : 'Tambah Obat Baru'}
        description={editingId ? 'Perbarui informasi obat' : 'Lengkapi data obat baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Obat <span className="text-red-500">*</span></label>
              <input className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Paracetamol 500mg" />
            </div>
            <div>
              <label className="label">Kategori <span className="text-red-500">*</span></label>
              <select className="input" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                <option value="">Pilih kategori</option>
                {medicineCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Satuan</label>
              <select className="input" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
                {['Tablet', 'Kapsul', 'Botol', 'Tube', 'Sachet', 'Strip'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Harga Beli (Rp)</label>
              <input type="number" className="input" value={form.hargaBeli || ''} onChange={(e) => setForm({ ...form, hargaBeli: Number(e.target.value) })} placeholder="0" />
            </div>
            <div>
              <label className="label">Harga Jual (Rp)</label>
              <input type="number" className="input" value={form.hargaJual || ''} onChange={(e) => setForm({ ...form, hargaJual: Number(e.target.value) })} placeholder="0" />
            </div>
            <div>
              <label className="label">Stok</label>
              <input type="number" className="input" value={form.stok || ''} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} placeholder="0" />
            </div>
            <div>
              <label className="label">Expired Date <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.expiredDate} onChange={(e) => setForm({ ...form, expiredDate: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Pilih supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Simpan Perubahan' : 'Tambah Obat'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Hapus Obat"
        size="sm"
      >
        <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-900">{confirmDelete?.nama}</span>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Batal</button>
          <button onClick={handleDelete} className="btn-primary flex-1 !bg-red-500 hover:!bg-red-600">Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
