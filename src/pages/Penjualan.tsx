import { useMemo, useState } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2,
  Receipt, Wallet, Printer,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { useToast } from '@/components/Toast';
import { formatRupiah, getStockStatus } from '@/lib/format';
import Modal from '@/components/Modal';
import type { SaleItem } from '@/types';

export default function Penjualan() {
  const { medicines, sales, addSale, settings } = useApp();
  const { showToast } = useToast();

  const pajak = settings.transaksi.pajakPersen;
  const enabledPayments = settings.enabledPayments;
  const cetakOtomatis = settings.transaksi.cetakOtomatis;
  const stokMinimum = settings.transaksi.stokMinimum;
  const apotekNama = settings.apotek.nama;
  const apotekAlamat = settings.apotek.alamat;
  const apotekTelepon = settings.apotek.telepon;
  const prefixInvoice = settings.transaksi.prefixInvoice;

  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [metode, setMetode] = useState(enabledPayments[0] ?? 'Tunai');
  const [successModal, setSuccessModal] = useState<{
    invoice: string;
    subtotal: number;
    pajakAmount: number;
    total: number;
    items: SaleItem[];
    metode: string;
  } | null>(null);

  // Daftar kategori unik dari medicines yang tersedia
  const categories = useMemo(() => {
    const cats = new Set(medicines.filter((m) => m.stok > 0).map((m) => m.kategori));
    return Array.from(cats).sort();
  }, [medicines]);

  const availableMedicines = useMemo(() => {
    return medicines.filter((m) => {
      if (m.stok <= 0) return false;
      const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !filterKategori || m.kategori === filterKategori;
      return matchSearch && matchKategori;
    });
  }, [medicines, search, filterKategori]);

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const pajakAmount = Math.round(subtotal * (pajak / 100));
  const cartTotal = subtotal + pajakAmount;
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
      setCart(
        cart.map((c) =>
          c.medicineId === medicineId
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.harga }
            : c,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: med.id,
          nama: med.nama,
          harga: med.hargaJual,
          qty: 1,
          subtotal: med.hargaJual,
        },
      ]);
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
    setCart(
      cart.map((c) =>
        c.medicineId === medicineId
          ? { ...c, qty: newQty, subtotal: newQty * c.harga }
          : c,
      ),
    );
  }

  function removeItem(medicineId: string) {
    setCart(cart.filter((c) => c.medicineId !== medicineId));
  }

  function processTransaction() {
    if (cart.length === 0) {
      showToast('Keranjang masih kosong', 'error');
      return;
    }
    const invoice = addSale(cart, metode, pajak);
    const snap = {
      invoice,
      subtotal,
      pajakAmount,
      total: subtotal + pajakAmount,
      items: [...cart],
      metode,
    };
    setCart([]);
    setSuccessModal(snap);

    // Cetak otomatis jika diaktifkan di pengaturan
    if (cetakOtomatis) {
      setTimeout(() => printStruk(snap), 300);
    }
  }

  // ── Fungsi cetak struk ──────────────────────────────────────────────────
  function printStruk(data: typeof successModal) {
    if (!data) return;
    const now = new Date().toLocaleString('id-ID');
    const rows = data.items
      .map(
        (i) =>
          `<tr>
            <td style="padding:2px 4px">${i.nama}</td>
            <td style="padding:2px 4px;text-align:center">${i.qty}</td>
            <td style="padding:2px 4px;text-align:right">${formatRupiah(i.harga)}</td>
            <td style="padding:2px 4px;text-align:right">${formatRupiah(i.subtotal)}</td>
          </tr>`,
      )
      .join('');

    const pajakRow =
      data.pajakAmount > 0
        ? `<tr>
            <td colspan="3" style="padding:4px;text-align:right;color:#666">Pajak (${pajak}%)</td>
            <td style="padding:4px;text-align:right">${formatRupiah(data.pajakAmount)}</td>
          </tr>`
        : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Struk ${data.invoice}</title>
        <style>
          body { font-family: monospace; font-size: 12px; max-width: 320px; margin: 0 auto; padding: 16px; }
          h2 { text-align: center; margin: 0 0 4px; font-size: 14px; }
          p { text-align: center; margin: 0 0 2px; font-size: 11px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { border-top: 1px dashed #999; border-bottom: 1px dashed #999; padding: 4px; font-size: 11px; }
          .divider { border-top: 1px dashed #999; margin: 6px 0; }
          .total { font-weight: bold; font-size: 13px; }
          .center { text-align: center; }
          @media print { body { max-width: 100%; } }
        </style>
      </head>
      <body>
        <h2>${apotekNama}</h2>
        <p>${apotekAlamat}</p>
        <p>Telp: ${apotekTelepon}</p>
        <div class="divider"></div>
        <p>Invoice: <strong>${data.invoice}</strong></p>
        <p>${now}</p>
        <p>Metode: ${data.metode}</p>
        <table>
          <thead>
            <tr>
              <th style="text-align:left">Item</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Harga</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:4px;text-align:right;color:#666">Subtotal</td>
              <td style="padding:4px;text-align:right">${formatRupiah(data.subtotal)}</td>
            </tr>
            ${pajakRow}
            <tr class="total">
              <td colspan="3" style="padding:4px;text-align:right;border-top:1px dashed #999">TOTAL</td>
              <td style="padding:4px;text-align:right;border-top:1px dashed #999">${formatRupiah(data.total)}</td>
            </tr>
          </tfoot>
        </table>
        <div class="divider"></div>
        <p style="margin-top:8px">Terima kasih telah berbelanja</p>
        <p>Simpan struk ini sebagai bukti pembelian</p>
        <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }</script>
      </body>
      </html>
    `;
    const w = window.open('', '_blank', 'width=380,height=600');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fadeIn">
      {/* Product List */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search + Filter */}
        <div className="card p-4 space-y-3">
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterKategori('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !filterKategori
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterKategori(cat === filterKategori ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterKategori === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {availableMedicines.map((m) => {
            const status = getStockStatus(m.stok, stokMinimum);
            const inCart = cart.find((c) => c.medicineId === m.id);
            return (
              <button
                key={m.id}
                onClick={() => addToCart(m.id)}
                className={`card p-4 text-left hover:border-teal-300 hover:shadow-md transition-all group relative ${
                  inCart ? 'border-teal-300 bg-teal-50/30' : ''
                }`}
              >
                {inCart && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {inCart.qty}
                  </span>
                )}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-teal-600" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      status === 'tersedia'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {m.stok} {m.satuan}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                  {m.nama}
                </p>
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
        <div
          className="card sticky top-20 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 6rem)' }}
        >
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
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Kosongkan
                </button>
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
                  <div
                    key={item.medicineId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nama}</p>
                      <p className="text-xs text-gray-400">{formatRupiah(item.harga)} / pcs</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => updateQty(item.medicineId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.medicineId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.medicineId)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 space-y-4">
              {/* Metode Pembayaran dari settings */}
              <div>
                <label className="label">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {enabledPayments.map((m) => (
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

              {/* Ringkasan Harga */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {pajak > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Pajak ({pajak}%)</span>
                    <span>{formatRupiah(pajakAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-teal-700">
                    {formatRupiah(cartTotal)}
                  </span>
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
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <p className="text-sm text-gray-500">Invoice</p>
          <p className="font-bold text-gray-900 text-lg">{successModal?.invoice}</p>

          {/* Rincian items */}
          {successModal && (
            <div className="mt-4 text-left space-y-1.5 max-h-40 overflow-y-auto">
              {successModal.items.map((i) => (
                <div key={i.medicineId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{i.nama} ×{i.qty}</span>
                  <span className="text-gray-800 font-medium flex-shrink-0">
                    {formatRupiah(i.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-1.5">
            {successModal && successModal.pajakAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(successModal.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Pajak ({pajak}%)</span>
                  <span>{formatRupiah(successModal.pajakAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-1.5" />
              </>
            )}
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Total Pembayaran</p>
              <p className="text-xl font-bold text-teal-700">
                {formatRupiah(successModal?.total ?? 0)}
              </p>
            </div>
            <p className="text-xs text-gray-400">{successModal?.metode}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => printStruk(successModal)}
            className="btn-secondary flex-1 gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button onClick={() => setSuccessModal(null)} className="btn-primary flex-1">
            Selesai
          </button>
        </div>
      </Modal>
    </div>
  );
}
