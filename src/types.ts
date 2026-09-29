export type StockStatus = 'tersedia' | 'menipis' | 'habis';

export interface Medicine {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  expiredDate: string;
  supplierId: string;
}

export interface SaleItem {
  medicineId: string;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoice: string;
  tanggal: string;
  items: SaleItem[];
  total: number;
  metodePembayaran: string;
  kasir: string;
}

export type StockActivityType = 'masuk' | 'keluar' | 'penyesuaian';

export interface StockActivity {
  id: string;
  tanggal: string;
  medicineId: string;
  namaObat: string;
  jenis: StockActivityType;
  jumlah: number;
  keterangan: string;
  user: string;
}

export interface Supplier {
  id: string;
  nama: string;
  kontak: string;
  telepon: string;
  alamat: string;
  jumlahObat: number;
  totalPembelian: number;
  status: 'aktif' | 'nonaktif';
}

export type PageKey =
  | 'dashboard'
  | 'penjualan'
  | 'obat'
  | 'stok'
  | 'supplier'
  | 'laporan'
  | 'pengaturan';
