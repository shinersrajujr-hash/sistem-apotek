import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { Medicine, Sale, StockActivity, Supplier } from '@/types';
import { medicines as initialMedicines, sales as initialSales, stockActivities as initialStockActivities, suppliers as initialSuppliers } from '@/lib/data';
import { generateInvoice } from '@/lib/format';

interface AppState {
  medicines: Medicine[];
  sales: Sale[];
  stockActivities: StockActivity[];
  suppliers: Supplier[];
  addMedicine: (m: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, m: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  addSale: (items: { medicineId: string; nama: string; harga: number; qty: number; subtotal: number }[], metodePembayaran: string) => string;
  addStockActivity: (a: Omit<StockActivity, 'id'>) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [stockActivities, setStockActivities] = useState<StockActivity[]>(initialStockActivities);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const addMedicine = useCallback((m: Omit<Medicine, 'id'>) => {
    const id = `MED-${String(Date.now()).slice(-6)}`;
    setMedicines((prev) => [{ ...m, id }, ...prev]);
  }, []);

  const updateMedicine = useCallback((id: string, patch: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addSale = useCallback((items: { medicineId: string; nama: string; harga: number; qty: number; subtotal: number }[], metodePembayaran: string) => {
    const invoice = generateInvoice();
    const newSale: Sale = {
      id: `TRX-${String(Date.now()).slice(-6)}`,
      invoice,
      tanggal: new Date().toISOString(),
      items,
      total: items.reduce((s, i) => s + i.subtotal, 0),
      metodePembayaran,
      kasir: 'Admin Apotek',
    };
    setSales((prev) => [newSale, ...prev]);

    // Reduce stock and add stock activities
    setMedicines((prev) =>
      prev.map((m) => {
        const item = items.find((i) => i.medicineId === m.id);
        if (item) {
          return { ...m, stok: Math.max(0, m.stok - item.qty) };
        }
        return m;
      })
    );

    items.forEach((item) => {
      setStockActivities((prev) => [
        {
          id: `STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          tanggal: new Date().toISOString(),
          medicineId: item.medicineId,
          namaObat: item.nama,
          jenis: 'keluar' as const,
          jumlah: item.qty,
          keterangan: `Penjualan ${invoice}`,
          user: 'Admin Apotek',
        },
        ...prev,
      ]);
    });

    return invoice;
  }, []);

  const addStockActivity = useCallback((a: Omit<StockActivity, 'id'>) => {
    const id = `STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setStockActivities((prev) => [{ ...a, id }, ...prev]);

    if (a.medicineId) {
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === a.medicineId ? { ...m, stok: Math.max(0, m.stok + a.jumlah) } : m
        )
      );
    }
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, 'id'>) => {
    const id = `SUP-${String(Date.now()).slice(-6)}`;
    setSuppliers((prev) => [{ ...s, id }, ...prev]);
  }, []);

  const updateSupplier = useCallback((id: string, patch: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        medicines,
        sales,
        stockActivities,
        suppliers,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addSale,
        addStockActivity,
        addSupplier,
        updateSupplier,
        deleteSupplier,
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


