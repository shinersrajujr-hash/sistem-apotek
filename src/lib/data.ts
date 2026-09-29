import type { Medicine, Sale, StockActivity, Supplier } from '@/types';

export const suppliers: Supplier[] = [
  {
    id: 'SUP-001',
    nama: 'PT Kimia Farma Tbk',
    kontak: 'Budi Santoso',
    telepon: '021-5551-2345',
    alamat: 'Jl. Veteran No. 9, Jakarta Pusat',
    jumlahObat: 45,
    totalPembelian: 125000000,
    status: 'aktif',
  },
  {
    id: 'SUP-002',
    nama: 'PT Kalbe Farma Tbk',
    kontak: 'Siti Rahayu',
    telepon: '021-5552-6789',
    alamat: 'Jl. Jend. Gatot Subroto Kav. 88, Jakarta Selatan',
    jumlahObat: 38,
    totalPembelian: 98000000,
    status: 'aktif',
  },
  {
    id: 'SUP-003',
    nama: 'PT Dexa Medica',
    kontak: 'Andi Wijaya',
    telepon: '031-5553-1122',
    alamat: 'Jl. Babarsari No. 2, Yogyakarta',
    jumlahObat: 22,
    totalPembelian: 54000000,
    status: 'aktif',
  },
  {
    id: 'SUP-004',
    nama: 'PT Tempo Scan Pacific',
    kontak: 'Dewi Lestari',
    telepon: '021-5554-3344',
    alamat: 'Jl. Dewi Sartika Raya No. 17, Jakarta Timur',
    jumlahObat: 18,
    totalPembelian: 42000000,
    status: 'aktif',
  },
  {
    id: 'SUP-005',
    nama: 'PT Sanbe Farma',
    kontak: 'Rudi Hartono',
    telepon: '022-5555-5566',
    alamat: 'Jl. Soekarno Hatta No. 543, Bandung',
    jumlahObat: 12,
    totalPembelian: 28500000,
    status: 'nonaktif',
  },
];

export const medicines: Medicine[] = [
  { id: 'MED-001', nama: 'Paracetamol 500mg', kategori: 'Analgetik', satuan: 'Tablet', hargaBeli: 150, hargaJual: 300, stok: 320, expiredDate: '2027-06-30', supplierId: 'SUP-001' },
  { id: 'MED-002', nama: 'Amoxicillin 500mg', kategori: 'Antibiotik', satuan: 'Kapsul', hargaBeli: 800, hargaJual: 1500, stok: 18, expiredDate: '2026-03-15', supplierId: 'SUP-002' },
  { id: 'MED-003', nama: 'Ibuprofen 400mg', kategori: 'Analgetik', satuan: 'Tablet', hargaBeli: 200, hargaJual: 400, stok: 150, expiredDate: '2027-01-20', supplierId: 'SUP-001' },
  { id: 'MED-004', nama: 'Vitamin C 1000mg', kategori: 'Vitamin', satuan: 'Tablet', hargaBeli: 500, hargaJual: 1000, stok: 8, expiredDate: '2026-12-10', supplierId: 'SUP-003' },
  { id: 'MED-005', nama: 'Cetirizine 10mg', kategori: 'Antihistamin', satuan: 'Tablet', hargaBeli: 300, hargaJual: 600, stok: 75, expiredDate: '2027-04-25', supplierId: 'SUP-002' },
  { id: 'MED-006', nama: 'Omeprazole 20mg', kategori: 'Antasida', satuan: 'Kapsul', hargaBeli: 1200, hargaJual: 2500, stok: 0, expiredDate: '2026-08-30', supplierId: 'SUP-004' },
  { id: 'MED-007', nama: 'Ranitidine 150mg', kategori: 'Antasida', satuan: 'Tablet', hargaBeli: 250, hargaJual: 500, stok: 200, expiredDate: '2027-02-14', supplierId: 'SUP-003' },
  { id: 'MED-008', nama: 'Salbutamol 2mg', kategori: 'Bronkodilator', satuan: 'Tablet', hargaBeli: 350, hargaJual: 700, stok: 12, expiredDate: '2026-11-05', supplierId: 'SUP-002' },
  { id: 'MED-009', nama: 'Asam Mefenamat 500mg', kategori: 'Analgetik', satuan: 'Tablet', hargaBeli: 180, hargaJual: 350, stok: 95, expiredDate: '2027-03-18', supplierId: 'SUP-001' },
  { id: 'MED-010', nama: 'Loratadine 10mg', kategori: 'Antihistamin', satuan: 'Tablet', hargaBeli: 400, hargaJual: 800, stok: 60, expiredDate: '2027-05-22', supplierId: 'SUP-004' },
  { id: 'MED-011', nama: 'Metformin 500mg', kategori: 'Antidiabetik', satuan: 'Tablet', hargaBeli: 600, hargaJual: 1200, stok: 130, expiredDate: '2027-07-11', supplierId: 'SUP-003' },
  { id: 'MED-012', nama: 'Amlodipine 5mg', kategori: 'Antihipertensi', satuan: 'Tablet', hargaBeli: 700, hargaJual: 1400, stok: 15, expiredDate: '2026-10-30', supplierId: 'SUP-002' },
  { id: 'MED-013', nama: 'Cough Syrup 100ml', kategori: 'Batuk', satuan: 'Botol', hargaBeli: 5000, hargaJual: 9000, stok: 40, expiredDate: '2026-09-15', supplierId: 'SUP-001' },
  { id: 'MED-014', nama: 'Povidone Iodine 10%', kategori: 'Antiseptik', satuan: 'Botol', hargaBeli: 8000, hargaJual: 15000, stok: 25, expiredDate: '2027-08-20', supplierId: 'SUP-004' },
  { id: 'MED-015', nama: 'Hydrocortisone Cream 1%', kategori: 'Dermatologi', satuan: 'Tube', hargaBeli: 6000, hargaJual: 12000, stok: 0, expiredDate: '2026-05-10', supplierId: 'SUP-005' },
  { id: 'MED-016', nama: 'Multivitamin Syrup 200ml', kategori: 'Vitamin', satuan: 'Botol', hargaBeli: 12000, hargaJual: 22000, stok: 55, expiredDate: '2027-01-30', supplierId: 'SUP-001' },
  { id: 'MED-017', nama: 'Attapulgite 500mg', kategori: 'Antidiare', satuan: 'Tablet', hargaBeli: 200, hargaJual: 400, stok: 85, expiredDate: '2027-06-12', supplierId: 'SUP-002' },
  { id: 'MED-018', nama: 'Bisoprolol 5mg', kategori: 'Antihipertensi', satuan: 'Tablet', hargaBeli: 900, hargaJual: 1800, stok: 5, expiredDate: '2026-12-25', supplierId: 'SUP-003' },
  { id: 'MED-019', nama: 'Glimepiride 2mg', kategori: 'Antidiabetik', satuan: 'Tablet', hargaBeli: 1100, hargaJual: 2200, stok: 48, expiredDate: '2027-04-08', supplierId: 'SUP-002' },
  { id: 'MED-020', nama: 'Ibuprofen Syrup 100ml', kategori: 'Analgetik', satuan: 'Botol', hargaBeli: 4500, hargaJual: 8500, stok: 22, expiredDate: '2026-11-18', supplierId: 'SUP-001' },
];

export const sales: Sale[] = [
  {
    id: 'TRX-001',
    invoice: 'INV-20260929-1001',
    tanggal: new Date().toISOString().replace(/T.*/, 'T08:15:00'),
    items: [
      { medicineId: 'MED-001', nama: 'Paracetamol 500mg', harga: 300, qty: 20, subtotal: 6000 },
      { medicineId: 'MED-004', nama: 'Vitamin C 1000mg', harga: 1000, qty: 5, subtotal: 5000 },
    ],
    total: 11000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Tunai',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-002',
    invoice: 'INV-20260929-1002',
    tanggal: new Date().toISOString().replace(/T.*/, 'T09:30:00'),
    items: [
      { medicineId: 'MED-003', nama: 'Ibuprofen 400mg', harga: 400, qty: 10, subtotal: 4000 },
      { medicineId: 'MED-013', nama: 'Cough Syrup 100ml', harga: 9000, qty: 2, subtotal: 18000 },
    ],
    total: 22000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'QRIS',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-003',
    invoice: 'INV-20260929-1003',
    tanggal: new Date().toISOString().replace(/T.*/, 'T10:45:00'),
    items: [
      { medicineId: 'MED-011', nama: 'Metformin 500mg', harga: 1200, qty: 30, subtotal: 36000 },
    ],
    total: 36000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Tunai',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-004',
    invoice: 'INV-20260929-1004',
    tanggal: new Date().toISOString().replace(/T.*/, 'T11:20:00'),
    items: [
      { medicineId: 'MED-010', nama: 'Loratadine 10mg', harga: 800, qty: 10, subtotal: 8000 },
      { medicineId: 'MED-002', nama: 'Amoxicillin 500mg', harga: 1500, qty: 5, subtotal: 7500 },
    ],
    total: 15500,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Debit',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-005',
    invoice: 'INV-20260928-1005',
    tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().replace(/T.*/, 'T14:10:00'); })(),
    items: [
      { medicineId: 'MED-016', nama: 'Multivitamin Syrup 200ml', harga: 22000, qty: 3, subtotal: 66000 },
      { medicineId: 'MED-001', nama: 'Paracetamol 500mg', harga: 300, qty: 15, subtotal: 4500 },
    ],
    total: 70500,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'QRIS',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-006',
    invoice: 'INV-20260928-1006',
    tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().replace(/T.*/, 'T16:00:00'); })(),
    items: [
      { medicineId: 'MED-014', nama: 'Povidone Iodine 10%', harga: 15000, qty: 2, subtotal: 30000 },
    ],
    total: 30000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Tunai',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-007',
    invoice: 'INV-20260927-1007',
    tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().replace(/T.*/, 'T09:00:00'); })(),
    items: [
      { medicineId: 'MED-009', nama: 'Asam Mefenamat 500mg', harga: 350, qty: 20, subtotal: 7000 },
      { medicineId: 'MED-017', nama: 'Attapulgite 500mg', harga: 400, qty: 10, subtotal: 4000 },
    ],
    total: 11000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Tunai',
    kasir: 'Admin Apotek',
  },
  {
    id: 'TRX-008',
    invoice: 'INV-20260927-1008',
    tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().replace(/T.*/, 'T13:30:00'); })(),
    items: [
      { medicineId: 'MED-012', nama: 'Amlodipine 5mg', harga: 1400, qty: 30, subtotal: 42000 },
      { medicineId: 'MED-018', nama: 'Bisoprolol 5mg', harga: 1800, qty: 10, subtotal: 18000 },
    ],
    total: 60000,
    pajakPersen: 0,
    pajakAmount: 0,
    metodePembayaran: 'Debit',
    kasir: 'Admin Apotek',
  },
];

export const stockActivities: StockActivity[] = [
  { id: 'STK-001', tanggal: (() => { const d = new Date(); return d.toISOString().replace(/T.*/, 'T07:00:00'); })(), medicineId: 'MED-001', namaObat: 'Paracetamol 500mg', jenis: 'masuk', jumlah: 200, keterangan: 'Pembelian dari PT Kimia Farma', user: 'Admin Apotek' },
  { id: 'STK-002', tanggal: (() => { const d = new Date(); return d.toISOString().replace(/T.*/, 'T08:15:00'); })(), medicineId: 'MED-001', namaObat: 'Paracetamol 500mg', jenis: 'keluar', jumlah: 20, keterangan: 'Penjualan INV-20260929-1001', user: 'Admin Apotek' },
  { id: 'STK-003', tanggal: (() => { const d = new Date(); return d.toISOString().replace(/T.*/, 'T09:30:00'); })(), medicineId: 'MED-013', namaObat: 'Cough Syrup 100ml', jenis: 'keluar', jumlah: 2, keterangan: 'Penjualan INV-20260929-1002', user: 'Admin Apotek' },
  { id: 'STK-004', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().replace(/T.*/, 'T10:00:00'); })(), medicineId: 'MED-016', namaObat: 'Multivitamin Syrup 200ml', jenis: 'masuk', jumlah: 50, keterangan: 'Pembelian dari PT Kimia Farma', user: 'Admin Apotek' },
  { id: 'STK-005', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().replace(/T.*/, 'T11:00:00'); })(), medicineId: 'MED-006', namaObat: 'Omeprazole 20mg', jenis: 'penyesuaian', jumlah: -5, keterangan: 'Stok rusak/expired', user: 'Admin Apotek' },
  { id: 'STK-006', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().replace(/T.*/, 'T14:10:00'); })(), medicineId: 'MED-016', namaObat: 'Multivitamin Syrup 200ml', jenis: 'keluar', jumlah: 3, keterangan: 'Penjualan INV-20260928-1005', user: 'Admin Apotek' },
  { id: 'STK-007', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().replace(/T.*/, 'T08:00:00'); })(), medicineId: 'MED-011', namaObat: 'Metformin 500mg', jenis: 'masuk', jumlah: 100, keterangan: 'Pembelian dari PT Dexa Medica', user: 'Admin Apotek' },
  { id: 'STK-008', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().replace(/T.*/, 'T13:30:00'); })(), medicineId: 'MED-012', namaObat: 'Amlodipine 5mg', jenis: 'keluar', jumlah: 30, keterangan: 'Penjualan INV-20260927-1008', user: 'Admin Apotek' },
  { id: 'STK-009', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().replace(/T.*/, 'T09:00:00'); })(), medicineId: 'MED-004', namaObat: 'Vitamin C 1000mg', jenis: 'penyesuaian', jumlah: -3, keterangan: 'Koreksi stok opname', user: 'Admin Apotek' },
  { id: 'STK-010', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().replace(/T.*/, 'T14:00:00'); })(), medicineId: 'MED-015', namaObat: 'Hydrocortisone Cream 1%', jenis: 'penyesuaian', jumlah: -10, keterangan: 'Produk expired', user: 'Admin Apotek' },
  { id: 'STK-011', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toISOString().replace(/T.*/, 'T10:00:00'); })(), medicineId: 'MED-005', namaObat: 'Cetirizine 10mg', jenis: 'masuk', jumlah: 75, keterangan: 'Pembelian dari PT Kalbe Farma', user: 'Admin Apotek' },
  { id: 'STK-012', tanggal: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toISOString().replace(/T.*/, 'T15:00:00'); })(), medicineId: 'MED-020', namaObat: 'Ibuprofen Syrup 100ml', jenis: 'masuk', jumlah: 22, keterangan: 'Pembelian dari PT Kimia Farma', user: 'Admin Apotek' },
];

export const medicineCategories = [
  'Analgetik',
  'Antibiotik',
  'Antihistamin',
  'Vitamin',
  'Antasida',
  'Bronkodilator',
  'Antidiabetik',
  'Antihipertensi',
  'Batuk',
  'Antiseptik',
  'Dermatologi',
  'Antidiare',
];

export const paymentMethods = ['Tunai', 'QRIS', 'Debit', 'Kredit'];

/**
 * Hitung pendapatan 7 hari terakhir dari data penjualan.
 * Mengembalikan array {tanggal, pendapatan} yang cocok untuk RevenueChart.
 */
export function computeRevenueLast7Days(salesData: Sale[]): { tanggal: string; pendapatan: number }[] {
  const result: { tanggal: string; pendapatan: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const pendapatan = salesData
      .filter((s) => new Date(s.tanggal).toDateString() === dateStr)
      .reduce((sum, s) => sum + s.total, 0);
    const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    result.push({ tanggal, pendapatan });
  }
  return result;
}

/**
 * Hitung obat terlaris dari data penjualan.
 * Mengembalikan top-N medicine berdasarkan qty terjual.
 */
export function computeTopMedicines(
  salesData: Sale[],
  n = 5,
): { nama: string; terjual: number; pendapatan: number }[] {
  const map: Record<string, { terjual: number; pendapatan: number }> = {};
  salesData.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!map[item.nama]) {
        map[item.nama] = { terjual: 0, pendapatan: 0 };
      }
      map[item.nama].terjual += item.qty;
      map[item.nama].pendapatan += item.subtotal;
    });
  });
  return Object.entries(map)
    .map(([nama, v]) => ({ nama, ...v }))
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, n);
}
