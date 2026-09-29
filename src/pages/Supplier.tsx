import { useMemo, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, MapPin, Truck, Package } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/Toast';
import { formatRupiah } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import type { Supplier } from '@/types';

const emptyForm: Omit<Supplier, 'id'> = {
  nama: '',
  kontak: '',
  telepon: '',
  alamat: '',
  jumlahObat: 0,
  totalPembelian: 0,
  status: 'aktif',
};

export default function Supplier() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()));
  }, [suppliers, search]);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(s: Supplier) {
    setForm({ ...s });
    setEditingId(s.id);
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.kontak) {
      showToast('Lengkapi nama dan kontak supplier', 'error');
      return;
    }
    if (editingId) {
      updateSupplier(editingId, form);
      showToast('Data supplier diperbarui');
    } else {
      addSupplier(form);
      showToast('Supplier baru ditambahkan');
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteSupplier(confirmDelete.id);
    showToast('Supplier dihapus', 'info');
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button onClick={openAdd} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Tambah Supplier
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{s.nama}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{s.id}</p>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{s.kontak} - {s.telepon}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{s.alamat}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Package className="w-3.5 h-3.5" />
                  Jumlah Obat
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{s.jumlahObat}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Pembelian</p>
                <p className="text-lg font-bold text-teal-700 mt-1">{formatRupiah(s.totalPembelian)}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => openEdit(s)} className="btn-ghost flex-1 !text-teal-600 hover:!bg-teal-50">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => setConfirmDelete(s)} className="btn-ghost flex-1 !text-red-500 hover:!bg-red-50">
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Truck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Tidak ada supplier ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Supplier' : 'Tambah Supplier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Supplier <span className="text-red-500">*</span></label>
              <input className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="PT ..." />
            </div>
            <div>
              <label className="label">Kontak Person <span className="text-red-500">*</span></label>
              <input className="input" value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} placeholder="Nama PIC" />
            </div>
            <div>
              <label className="label">Telepon</label>
              <input className="input" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} placeholder="021-xxx-xxxx" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Alamat</label>
              <textarea className="input min-h-[70px] resize-none" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'aktif' | 'nonaktif' })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">{editingId ? 'Simpan' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Hapus Supplier" size="sm">
        <p className="text-sm text-gray-600">Hapus <span className="font-semibold text-gray-900">{confirmDelete?.nama}</span>?</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Batal</button>
          <button onClick={handleDelete} className="btn-primary flex-1 !bg-red-500 hover:!bg-red-600">Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
