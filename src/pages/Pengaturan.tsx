import { useState } from 'react';
import { Store, User, CreditCard, Settings, Check, Save } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { paymentMethods } from '@/lib/data';

type Tab = 'apotek' | 'admin' | 'transaksi' | 'pembayaran';

export default function Pengaturan() {
  const { showToast } = useToast();

  const [tab, setTab] = useState<Tab>('apotek');
  const [enabledPayments, setEnabledPayments] = useState<string[]>(['Tunai', 'QRIS']);

  const [apotekData, setApotekData] = useState({
    nama: 'Apotek Sehat Sentosa',
    alamat: 'Jl. Merdeka No. 123, Jakarta Pusat',
    telepon: '021-555-1234',
    email: 'info@apoteksehat.co.id',
    jamOperasional: '08:00 - 22:00',
    nomorIzin: 'SIIPA-123456789',
  });

  const [adminData, setAdminData] = useState({
    nama: 'Admin Apotek',
    email: 'admin@apoteksehat.co.id',
    telepon: '0812-3456-7890',
    role: 'Administrator',
  });

  const [transaksiData, setTransaksiData] = useState({
    pajakPersen: 0,
    prefixInvoice: 'INV',
    stokMinimum: 20,
    cetakOtomatis: true,
  });

  const tabs: { key: Tab; label: string; icon: typeof Store }[] = [
    { key: 'apotek', label: 'Profil Apotek', icon: Store },
    { key: 'admin', label: 'Data Admin', icon: User },
    { key: 'transaksi', label: 'Transaksi', icon: Settings },
    { key: 'pembayaran', label: 'Metode Pembayaran', icon: CreditCard },
  ];

  function save() {
    showToast('Pengaturan berhasil disimpan');
  }

  function togglePayment(method: string) {
    setEnabledPayments((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
      {/* Tabs Sidebar */}
      <div className="card p-3 h-fit lg:sticky lg:top-20">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${tab === t.key ? 'text-teal-600' : 'text-gray-400'}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        <div className="card p-6">
          {tab === 'apotek' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Profil Apotek</h3>
                <p className="text-sm text-gray-400 mt-1">Informasi dasar tentang apotek Anda</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Nama Apotek</label>
                  <input className="input" value={apotekData.nama} onChange={(e) => setApotekData({ ...apotekData, nama: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Alamat</label>
                  <textarea className="input min-h-[70px] resize-none" value={apotekData.alamat} onChange={(e) => setApotekData({ ...apotekData, alamat: e.target.value })} />
                </div>
                <div>
                  <label className="label">Telepon</label>
                  <input className="input" value={apotekData.telepon} onChange={(e) => setApotekData({ ...apotekData, telepon: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={apotekData.email} onChange={(e) => setApotekData({ ...apotekData, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Jam Operasional</label>
                  <input className="input" value={apotekData.jamOperasional} onChange={(e) => setApotekData({ ...apotekData, jamOperasional: e.target.value })} />
                </div>
                <div>
                  <label className="label">Nomor Izin Apotek</label>
                  <input className="input" value={apotekData.nomorIzin} onChange={(e) => setApotekData({ ...apotekData, nomorIzin: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Data Admin</h3>
                <p className="text-sm text-gray-400 mt-1">Kelola informasi akun administrator</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-teal-100/30 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl">
                  AA
                </div>
                <div>
                  <p className="font-bold text-gray-900">{adminData.nama}</p>
                  <p className="text-sm text-gray-500">{adminData.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input" value={adminData.nama} onChange={(e) => setAdminData({ ...adminData, nama: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={adminData.email} onChange={(e) => setAdminData({ ...adminData, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Telepon</label>
                  <input className="input" value={adminData.telepon} onChange={(e) => setAdminData({ ...adminData, telepon: e.target.value })} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input className="input bg-gray-50" value={adminData.role} disabled />
                </div>
              </div>
            </div>
          )}

          {tab === 'transaksi' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Pengaturan Transaksi</h3>
                <p className="text-sm text-gray-400 mt-1">Konfigurasi default untuk transaksi penjualan</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Pajak (%)</label>
                  <input type="number" className="input" value={transaksiData.pajakPersen} onChange={(e) => setTransaksiData({ ...transaksiData, pajakPersen: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Prefix Invoice</label>
                  <input className="input" value={transaksiData.prefixInvoice} onChange={(e) => setTransaksiData({ ...transaksiData, prefixInvoice: e.target.value })} />
                </div>
                <div>
                  <label className="label">Stok Minimum</label>
                  <input type="number" className="input" value={transaksiData.stokMinimum} onChange={(e) => setTransaksiData({ ...transaksiData, stokMinimum: Number(e.target.value) })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setTransaksiData({ ...transaksiData, cetakOtomatis: !transaksiData.cetakOtomatis })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${transaksiData.cetakOtomatis ? 'bg-teal-600' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${transaksiData.cetakOtomatis ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">Cetak struk otomatis</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === 'pembayaran' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Metode Pembayaran</h3>
                <p className="text-sm text-gray-400 mt-1">Pilih metode pembayaran yang tersedia</p>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((m) => {
                  const enabled = enabledPayments.includes(m);
                  return (
                    <div key={m} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-400'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m}</p>
                          <p className="text-xs text-gray-400">{enabled ? 'Aktif' : 'Nonaktif'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePayment(m)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-teal-600' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
            <button onClick={save} className="btn-primary">
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
