import { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Receipt, Wallet } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/Toast';
import { formatRupiah, getStockStatus } from '@/lib/format';
import { paymentMethods } from '@/lib/data';
import Modal from '@/components/Modal';
import type { SaleItem } from '@/types';

export default function Penjualan() {
  const { medicines, sales, addSale } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [metode, setMetode] = useState('Tunai');
  const [successModal, setSuccessModal] = useState<{ invoice: string; total: number } | null>(null);

  const availableMedicines = useMemo(() => {
    return medicines.filter((m) => m.stok > 0 && m.nama.toLowerCase().includes(search.toLowerCase()));
  }, [medicines, search]);

  const cartTotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(medicineId: string) {
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;
    const existing = cart.find((c) => c.medicineId === medicineId);
    if (existing) {
      if (existing.qty >= med.stok) {
        showToast(`Stok ${med.nama} hanya ${med.stok}`, 'error');
        return;
      }
      setCart(cart.map((c) =>
        c.medicineId === medicineId
          ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.harga }
          : c
      ));
    } else {
      setCart([...cart, {
        medicineId: med.id,
        nama: med.nama,
        harga: med.hargaJual,
        qty: 1,
        subtotal: med.hargaJual,
      }]);
    }
  }

  function updateQty(medicineId: string, delta: number) {
    const item = cart.find((c) => c.medicineId === medicineId);
    if (!item) return;
    const med = medicines.find((m) => m.id === medicineId);
    if (!med) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      setCart(cart.filter((c) => c.medicineId !== medicineId));
      return;
    }
    if (newQty > med.stok) {
      showToast(`Stok ${med.nama} hanya ${med.stok}`, 'error');
      return;
    }
    setCart(cart.map((c) =>
      c.medicineId === medicineId
        ? { ...c, qty: newQty, subtotal: newQty * c.harga }
        : c
    ));
  }

  function removeItem(medicineId: string) {
    setCart(cart.filter((c) => c.medicineId !== medicineId));
  }

  function processTransaction() {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong', 'error');
      return;
    }
    const invoice = addSale(cart, metode);
    setSuccessModal({ invoice, total: cartTotal });
    setCart([]);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fadeIn">
      {/* Product List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari obat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {availableMedicines.map((m) => {
            const status = getStockStatus(m.stok);
            return (
              <button
                key={m.id}
                onClick={() => addToCart(m.id)}
                className="card p-4 text-left hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    status === 'tersedia' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {m.stok} {m.satuan}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{m.nama}</p>
                <p className="text-xs text-gray-400 mt-1">{m.kategori}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm font-bold text-teal-700">{formatRupiah(m.hargaJual)}</p>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-teal-600" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {availableMedicines.length === 0 && (
          <div className="card p-12 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Obat tidak ditemukan</p>
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="lg:col-span-2">
        <div className="card sticky top-20 flex flex-col" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Keranjang</h3>
                  <p className="text-xs text-gray-400">{cartCount} item</p>
                </div>
              </div>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Kosongkan</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Keranjang masih kosong</p>
                <p className="text-xs text-gray-300 mt-1">Pilih obat untuk mulai transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.medicineId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nama}</p>
                      <p className="text-xs text-gray-400">{formatRupiah(item.harga)} / pcs</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 p-1">
                      <button onClick={() => updateQty(item.medicineId, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.medicineId, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatRupiah(item.subtotal)}</p>
                    </div>
                    <button onClick={() => removeItem(item.medicineId)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 space-y-4">
              <div>
                <label className="label">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetode(m)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        metode === m
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Diskon</span>
                  <span>{formatRupiah(0)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-teal-700">{formatRupiah(cartTotal)}</span>
                </div>
              </div>

              <button onClick={processTransaction} className="btn-primary w-full py-3 text-base">
                <CheckCircle2 className="w-5 h-5" />
                Proses Transaksi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        open={!!successModal}
        onClose={() => setSuccessModal(null)}
        title="Transaksi Berhasil"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <p className="text-sm text-gray-500">Invoice</p>
          <p className="font-bold text-gray-900 text-lg">{successModal?.invoice}</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Pembayaran</p>
            <p className="text-2xl font-bold text-teal-700">{formatRupiah(successModal?.total ?? 0)}</p>
          </div>
        </div>
        <button onClick={() => setSuccessModal(null)} className="btn-primary w-full">Selesai</button>
      </Modal>
    </div>
  );
}
