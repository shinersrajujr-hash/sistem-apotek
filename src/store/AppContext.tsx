import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Medicine, Sale, StockActivity, Supplier } from '@/types';
import {
  medicines as initialMedicines,
  sales as initialSales,
  stockActivities as initialStockActivities,
  suppliers as initialSuppliers,
} from '@/lib/data';
import { generateInvoice } from '@/lib/format';
import * as db from '@/lib/supabaseService';
import { isSupabaseConfigured } from '@/lib/supabase';

// ─── Settings ────────────────────────────────────────────────────────────────
export interface ApotekSettings {
  apotek: {
    nama: string;
    alamat: string;
    telepon: string;
    email: string;
    jamOperasional: string;
    nomorIzin: string;
  };
  admin: {
    nama: string;
    email: string;
    telepon: string;
    role: string;
  };
  transaksi: {
    pajakPersen: number;
    prefixInvoice: string;
    stokMinimum: number;
    cetakOtomatis: boolean;
  };
  enabledPayments: string[];
}

export const defaultSettings: ApotekSettings = {
  apotek: {
    nama: 'Apotek Sehat Sentosa',
    alamat: 'Jl. Merdeka No. 123, Jakarta Pusat',
    telepon: '021-555-1234',
    email: 'info@apoteksehat.co.id',
    jamOperasional: '08:00 - 22:00',
    nomorIzin: 'SIIPA-123456789',
  },
  admin: {
    nama: 'Admin Apotek',
    email: 'admin@apoteksehat.co.id',
    telepon: '0812-3456-7890',
    role: 'Administrator',
  },
  transaksi: {
    pajakPersen: 0,
    prefixInvoice: 'INV',
    stokMinimum: 20,
    cetakOtomatis: true,
  },
  enabledPayments: ['Tunai', 'QRIS', 'Debit', 'Kredit'],
};

// ─── localStorage helpers (fallback) ─────────────────────────────────────────
const LS = {
  medicines:       'apotek_medicines',
  sales:           'apotek_sales',
  stockActivities: 'apotek_stock_activities',
  suppliers:       'apotek_suppliers',
  settings:        'apotek_settings',
};

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function lsSet<T>(key: string, val: T): void {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
}

// ─── Context types ────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'loading' | 'synced' | 'offline';

interface AppState {
  medicines:       Medicine[];
  sales:           Sale[];
  stockActivities: StockActivity[];
  suppliers:       Supplier[];
  settings:        ApotekSettings;
  syncStatus:      SyncStatus;

  addMedicine:     (m: Omit<Medicine, 'id'>) => void;
  updateMedicine:  (id: string, patch: Partial<Medicine>) => void;
  deleteMedicine:  (id: string) => void;

  addSale: (
    items: { medicineId: string; nama: string; harga: number; qty: number; subtotal: number }[],
    metodePembayaran: string,
    pajak: number,
  ) => string;

  addStockActivity: (a: Omit<StockActivity, 'id'>) => void;

  addSupplier:    (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  updateSettings: (patch: Partial<ApotekSettings>) => void;
}

const AppContext = createContext<AppState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  // Inisialisasi dari localStorage agar UI langsung tampil
  const [medicines,       setMedicines]       = useState<Medicine[]>(() => lsGet(LS.medicines,       initialMedicines));
  const [sales,           setSales]           = useState<Sale[]>(() => lsGet(LS.sales,               initialSales));
  const [stockActivities, setStockActivities] = useState<StockActivity[]>(() => lsGet(LS.stockActivities, initialStockActivities));
  const [suppliers,       setSuppliers]       = useState<Supplier[]>(() => lsGet(LS.suppliers,       initialSuppliers));
  const [settings,        setSettings]        = useState<ApotekSettings>(() => lsGet(LS.settings,    defaultSettings));
  const [syncStatus,      setSyncStatus]      = useState<SyncStatus>('idle');

  // Ref untuk mengecek apakah Supabase berhasil terhubung
  const supabaseReady = useRef(false);

  // ── Sync dari Supabase saat mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadFromSupabase() {
      setSyncStatus('loading');
      try {
        // Jika Supabase belum dikonfigurasi, langsung pakai data lokal
        if (!isSupabaseConfigured) {
          console.info('[Apotek] Supabase belum dikonfigurasi, menggunakan data lokal.');
          setSyncStatus('offline');
          return;
        }

        // Seed data awal ke Supabase jika tabel kosong
        await db.seedIfEmpty(suppliers, medicines, sales, stockActivities);

        // Ambil semua data dari Supabase secara paralel
        const [dbSuppliers, dbMedicines, dbSales, dbStock, dbSettings] = await Promise.all([
          db.fetchSuppliers(),
          db.fetchMedicines(),
          db.fetchSales(),
          db.fetchStockActivities(),
          db.fetchSettings(),
        ]);

        if (cancelled) return;

        setSuppliers(dbSuppliers);
        setMedicines(dbMedicines);
        setSales(dbSales);
        setStockActivities(dbStock);
        if (dbSettings) setSettings(dbSettings);

        // Update localStorage sebagai cache
        lsSet(LS.suppliers,       dbSuppliers);
        lsSet(LS.medicines,       dbMedicines);
        lsSet(LS.sales,           dbSales);
        lsSet(LS.stockActivities, dbStock);
        if (dbSettings) lsSet(LS.settings, dbSettings);

        supabaseReady.current = true;
        setSyncStatus('synced');
      } catch (err) {
        if (cancelled) return;
        console.warn('[Apotek] Supabase tidak tersedia, menggunakan data lokal:', err);
        setSyncStatus('offline');
      }
    }

    loadFromSupabase();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist ke localStorage saat state berubah ────────────────────────────
  useEffect(() => { lsSet(LS.medicines,       medicines);       }, [medicines]);
  useEffect(() => { lsSet(LS.sales,           sales);           }, [sales]);
  useEffect(() => { lsSet(LS.stockActivities, stockActivities); }, [stockActivities]);
  useEffect(() => { lsSet(LS.suppliers,       suppliers);       }, [suppliers]);
  useEffect(() => { lsSet(LS.settings,        settings);        }, [settings]);

  // ── MEDICINE CRUD ─────────────────────────────────────────────────────────
  const addMedicine = useCallback((m: Omit<Medicine, 'id'>) => {
    const id = `MED-${String(Date.now()).slice(-6)}`;
    const newMed: Medicine = { ...m, id };
    setMedicines((prev) => [newMed, ...prev]);
    if (supabaseReady.current) {
      db.insertMedicine(m, id).catch((e) => console.error('[addMedicine]', e));
    }
  }, []);

  const updateMedicine = useCallback((id: string, patch: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    if (supabaseReady.current) {
      db.updateMedicineDb(id, patch).catch((e) => console.error('[updateMedicine]', e));
    }
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    if (supabaseReady.current) {
      db.deleteMedicineDb(id).catch((e) => console.error('[deleteMedicine]', e));
    }
  }, []);

  // ── SALES ─────────────────────────────────────────────────────────────────
  const addSale = useCallback(
    (
      items: { medicineId: string; nama: string; harga: number; qty: number; subtotal: number }[],
      metodePembayaran: string,
      pajak: number,
    ) => {
      const subtotalTotal = items.reduce((s, i) => s + i.subtotal, 0);
      const pajakAmount   = Math.round(subtotalTotal * (pajak / 100));
      const total         = subtotalTotal + pajakAmount;
      const invoice       = generateInvoice(settings.transaksi.prefixInvoice || 'INV');

      const newSale: Sale = {
        id:               `TRX-${String(Date.now()).slice(-6)}`,
        invoice,
        tanggal:          new Date().toISOString(),
        items,
        total,
        pajakPersen:      pajak,
        pajakAmount,
        metodePembayaran,
        kasir:            settings.admin.nama || 'Admin Apotek',
      };

      setSales((prev) => [newSale, ...prev]);

      // Kurangi stok lokal
      setMedicines((prev) =>
        prev.map((m) => {
          const item = items.find((i) => i.medicineId === m.id);
          return item ? { ...m, stok: Math.max(0, m.stok - item.qty) } : m;
        }),
      );

      // Catat stock activity keluar
      items.forEach((item) => {
        const act: StockActivity = {
          id:         `STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          tanggal:    new Date().toISOString(),
          medicineId: item.medicineId,
          namaObat:   item.nama,
          jenis:      'keluar',
          jumlah:     item.qty,
          keterangan: `Penjualan ${invoice}`,
          user:       settings.admin.nama || 'Admin Apotek',
        };
        setStockActivities((prev) => [act, ...prev]);
        if (supabaseReady.current) {
          db.insertStockActivity(act).catch((e) => console.error('[addSale/stock]', e));
        }
      });

      // Update stok di Supabase untuk setiap medicine yang terjual
      if (supabaseReady.current) {
        db.insertSale(newSale).catch((e) => console.error('[addSale]', e));
        items.forEach((item) => {
          // Ambil stok terbaru dari state dan update ke DB
          setMedicines((prev) => {
            const med = prev.find((m) => m.id === item.medicineId);
            if (med) {
              db.updateMedicineDb(med.id, { stok: med.stok }).catch(
                (e) => console.error('[addSale/stok update]', e),
              );
            }
            return prev; // tidak ubah state
          });
        });
      }

      return invoice;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.transaksi.prefixInvoice, settings.admin.nama],
  );

  // ── STOCK ACTIVITIES ──────────────────────────────────────────────────────
  const addStockActivity = useCallback((a: Omit<StockActivity, 'id'>) => {
    const id  = `STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const act: StockActivity = { ...a, id };
    setStockActivities((prev) => [act, ...prev]);

    if (a.medicineId) {
      setMedicines((prev) =>
        prev.map((m) => {
          if (m.id !== a.medicineId) return m;
          let delta = 0;
          if (a.jenis === 'masuk')        delta =  Math.abs(a.jumlah);
          else if (a.jenis === 'keluar')  delta = -Math.abs(a.jumlah);
          else                            delta =  a.jumlah; // penyesuaian: signed
          const newStok = Math.max(0, m.stok + delta);
          // Sync stok ke Supabase
          if (supabaseReady.current) {
            db.updateMedicineDb(m.id, { stok: newStok }).catch(
              (e) => console.error('[addStockActivity/stok]', e),
            );
          }
          return { ...m, stok: newStok };
        }),
      );
    }

    if (supabaseReady.current) {
      db.insertStockActivity(act).catch((e) => console.error('[addStockActivity]', e));
    }
  }, []);

  // ── SUPPLIERS ─────────────────────────────────────────────────────────────
  const addSupplier = useCallback((s: Omit<Supplier, 'id'>) => {
    const id = `SUP-${String(Date.now()).slice(-6)}`;
    setSuppliers((prev) => [{ ...s, id }, ...prev]);
    if (supabaseReady.current) {
      const { jumlahObat: _j, ...rest } = { ...s, id };
      db.insertSupplier(rest, id).catch((e) => console.error('[addSupplier]', e));
    }
  }, []);

  const updateSupplier = useCallback((id: string, patch: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    if (supabaseReady.current) {
      const { jumlahObat: _j, id: _id, ...rest } = patch as Supplier;
      db.updateSupplierDb(id, rest).catch((e) => console.error('[updateSupplier]', e));
    }
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    if (supabaseReady.current) {
      db.deleteSupplierDb(id).catch((e) => console.error('[deleteSupplier]', e));
    }
  }, []);

  // ── SETTINGS ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<ApotekSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (supabaseReady.current) {
        db.upsertSettings(next).catch((e) => console.error('[updateSettings]', e));
      }
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        medicines,
        sales,
        stockActivities,
        suppliers,
        settings,
        syncStatus,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addSale,
        addStockActivity,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
