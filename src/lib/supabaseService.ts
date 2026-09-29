/**
 * supabaseService.ts
 * Semua operasi database ke Supabase.
 * AppContext memanggil fungsi-fungsi ini, tidak langsung ke supabase client.
 */

import { supabase } from '@/lib/supabase';
import type { Medicine, Sale, SaleItem, StockActivity, Supplier } from '@/types';
import type { ApotekSettings } from '@/store/AppContext';

// ─── Helper: konversi snake_case DB ↔ camelCase App ──────────────────────────

function dbToMedicine(r: Record<string, unknown>): Medicine {
  return {
    id:           r.id as string,
    nama:         r.nama as string,
    kategori:     r.kategori as string,
    satuan:       r.satuan as string,
    hargaBeli:    r.harga_beli as number,
    hargaJual:    r.harga_jual as number,
    stok:         r.stok as number,
    expiredDate:  r.expired_date as string,
    supplierId:   r.supplier_id as string ?? '',
  };
}

function medicineToDb(m: Omit<Medicine, 'id'>, id?: string) {
  return {
    ...(id ? { id } : {}),
    nama:         m.nama,
    kategori:     m.kategori,
    satuan:       m.satuan,
    harga_beli:   m.hargaBeli,
    harga_jual:   m.hargaJual,
    stok:         m.stok,
    expired_date: m.expiredDate,
    supplier_id:  m.supplierId || null,
  };
}

function dbToSupplier(r: Record<string, unknown>): Supplier {
  return {
    id:              r.id as string,
    nama:            r.nama as string,
    kontak:          r.kontak as string,
    telepon:         r.telepon as string,
    alamat:          r.alamat as string,
    jumlahObat:      0,           // dihitung di UI dari medicines
    totalPembelian:  r.total_pembelian as number,
    status:          r.status as 'aktif' | 'nonaktif',
  };
}

function supplierToDb(s: Omit<Supplier, 'id' | 'jumlahObat'>, id?: string) {
  return {
    ...(id ? { id } : {}),
    nama:             s.nama,
    kontak:           s.kontak,
    telepon:          s.telepon,
    alamat:           s.alamat,
    total_pembelian:  s.totalPembelian,
    status:           s.status,
  };
}

function dbToSale(
  r: Record<string, unknown>,
  items: SaleItem[],
): Sale {
  return {
    id:                r.id as string,
    invoice:           r.invoice as string,
    tanggal:           r.tanggal as string,
    items,
    total:             r.total as number,
    pajakPersen:       Number(r.pajak_persen ?? 0),
    pajakAmount:       r.pajak_amount as number,
    metodePembayaran:  r.metode_pembayaran as string,
    kasir:             r.kasir as string,
  };
}

function dbToSaleItem(r: Record<string, unknown>): SaleItem {
  return {
    medicineId: r.medicine_id as string,
    nama:       r.nama as string,
    harga:      r.harga as number,
    qty:        r.qty as number,
    subtotal:   r.subtotal as number,
  };
}

function dbToStockActivity(r: Record<string, unknown>): StockActivity {
  return {
    id:          r.id as string,
    tanggal:     r.tanggal as string,
    medicineId:  r.medicine_id as string,
    namaObat:    r.nama_obat as string,
    jenis:       r.jenis as 'masuk' | 'keluar' | 'penyesuaian',
    jumlah:      r.jumlah as number,
    keterangan:  r.keterangan as string,
    user:        r.user_name as string,
  };
}

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => dbToSupplier(r as Record<string, unknown>));
}

export async function insertSupplier(
  s: Omit<Supplier, 'id' | 'jumlahObat'>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .insert(supplierToDb(s, id));
  if (error) throw error;
}

export async function updateSupplierDb(
  id: string,
  patch: Partial<Omit<Supplier, 'id' | 'jumlahObat'>>,
): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.nama             !== undefined) dbPatch.nama            = patch.nama;
  if (patch.kontak           !== undefined) dbPatch.kontak          = patch.kontak;
  if (patch.telepon          !== undefined) dbPatch.telepon         = patch.telepon;
  if (patch.alamat           !== undefined) dbPatch.alamat          = patch.alamat;
  if (patch.totalPembelian   !== undefined) dbPatch.total_pembelian = patch.totalPembelian;
  if (patch.status           !== undefined) dbPatch.status          = patch.status;

  const { error } = await supabase
    .from('suppliers')
    .update(dbPatch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSupplierDb(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── MEDICINES ────────────────────────────────────────────────────────────────

export async function fetchMedicines(): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => dbToMedicine(r as Record<string, unknown>));
}

export async function insertMedicine(
  m: Omit<Medicine, 'id'>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('medicines')
    .insert(medicineToDb(m, id));
  if (error) throw error;
}

export async function updateMedicineDb(
  id: string,
  patch: Partial<Medicine>,
): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.nama         !== undefined) dbPatch.nama          = patch.nama;
  if (patch.kategori     !== undefined) dbPatch.kategori      = patch.kategori;
  if (patch.satuan       !== undefined) dbPatch.satuan        = patch.satuan;
  if (patch.hargaBeli    !== undefined) dbPatch.harga_beli    = patch.hargaBeli;
  if (patch.hargaJual    !== undefined) dbPatch.harga_jual    = patch.hargaJual;
  if (patch.stok         !== undefined) dbPatch.stok          = patch.stok;
  if (patch.expiredDate  !== undefined) dbPatch.expired_date  = patch.expiredDate;
  if (patch.supplierId   !== undefined) dbPatch.supplier_id   = patch.supplierId || null;

  const { error } = await supabase
    .from('medicines')
    .update(dbPatch)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMedicineDb(id: string): Promise<void> {
  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── SALES ────────────────────────────────────────────────────────────────────

export async function fetchSales(): Promise<Sale[]> {
  // Ambil sales + semua sale_items dalam dua query paralel
  const [salesRes, itemsRes] = await Promise.all([
    supabase.from('sales').select('*').order('tanggal', { ascending: false }),
    supabase.from('sale_items').select('*'),
  ]);

  if (salesRes.error) throw salesRes.error;
  if (itemsRes.error) throw itemsRes.error;

  const allItems = (itemsRes.data ?? []) as Record<string, unknown>[];

  return (salesRes.data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const items = allItems
      .filter((i) => i.sale_id === r.id)
      .map(dbToSaleItem);
    return dbToSale(r, items);
  });
}

export async function insertSale(sale: Sale): Promise<void> {
  // 1. Simpan header sale
  const { error: saleErr } = await supabase.from('sales').insert({
    id:                sale.id,
    invoice:           sale.invoice,
    tanggal:           sale.tanggal,
    total:             sale.total,
    pajak_persen:      sale.pajakPersen,
    pajak_amount:      sale.pajakAmount,
    metode_pembayaran: sale.metodePembayaran,
    kasir:             sale.kasir,
  });
  if (saleErr) throw saleErr;

  // 2. Simpan semua item sekaligus
  if (sale.items.length > 0) {
    const { error: itemsErr } = await supabase.from('sale_items').insert(
      sale.items.map((i) => ({
        id:           crypto.randomUUID(),
        sale_id:      sale.id,
        medicine_id:  i.medicineId,
        nama:         i.nama,
        harga:        i.harga,
        qty:          i.qty,
        subtotal:     i.subtotal,
      })),
    );
    if (itemsErr) throw itemsErr;
  }
}

// ─── STOCK ACTIVITIES ─────────────────────────────────────────────────────────

export async function fetchStockActivities(): Promise<StockActivity[]> {
  const { data, error } = await supabase
    .from('stock_activities')
    .select('*')
    .order('tanggal', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => dbToStockActivity(r as Record<string, unknown>));
}

export async function insertStockActivity(a: StockActivity): Promise<void> {
  const { error } = await supabase.from('stock_activities').insert({
    id:          a.id,
    tanggal:     a.tanggal,
    medicine_id: a.medicineId,
    nama_obat:   a.namaObat,
    jenis:       a.jenis,
    jumlah:      a.jumlah,
    keterangan:  a.keterangan,
    user_name:   a.user,
  });
  if (error) throw error;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<ApotekSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('data')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.data || Object.keys(data.data as object).length === 0) return null;
  return data.data as unknown as ApotekSettings;
}

export async function upsertSettings(settings: ApotekSettings): Promise<void> {
  const { error } = await supabase.from('settings').upsert({
    id:   1,
    data: settings as unknown as Record<string, unknown>,
  });
  if (error) throw error;
}

// ─── SEED: upload data awal ke Supabase ─────────────────────────────────────
/**
 * Dipanggil sekali saat pertama kali connect ke Supabase (jika tabel kosong).
 * Mengupload data seed dari localStorage / in-memory ke Supabase.
 */
export async function seedIfEmpty(
  suppliers: Supplier[],
  medicines: Medicine[],
  sales: Sale[],
  stockActivities: StockActivity[],
): Promise<void> {
  // Cek apakah tabel sudah ada data
  const { count: supplierCount } = await supabase
    .from('suppliers')
    .select('id', { count: 'exact', head: true });

  if ((supplierCount ?? 0) > 0) {
    // Data sudah ada, tidak perlu seed
    return;
  }

  // Upload suppliers dulu (karena medicines FK ke suppliers)
  for (const s of suppliers) {
    try {
      await supabase.from('suppliers').insert(supplierToDb(s, s.id));
    } catch {
      // abaikan duplikat
    }
  }

  // Upload medicines
  for (const m of medicines) {
    try {
      await supabase.from('medicines').insert(medicineToDb(m, m.id));
    } catch {
      // abaikan duplikat
    }
  }

  // Upload sales + items
  for (const sale of sales) {
    try {
      await insertSale(sale);
    } catch {
      // abaikan duplikat
    }
  }

  // Upload stock activities
  for (const act of stockActivities) {
    try {
      await insertStockActivity(act);
    } catch {
      // abaikan duplikat
    }
  }
}
