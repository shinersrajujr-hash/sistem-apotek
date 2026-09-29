export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTanggalShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTanggalTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Kembalikan status stok berdasarkan threshold yang bisa dikonfigurasi.
 * @param stok    jumlah stok saat ini
 * @param minimum ambang batas stok menipis (default 20)
 */
export function getStockStatus(stok: number, minimum = 20): 'tersedia' | 'menipis' | 'habis' {
  if (stok === 0) return 'habis';
  if (stok <= minimum) return 'menipis';
  return 'tersedia';
}

/**
 * Buat nomor invoice dengan prefix yang bisa dikonfigurasi.
 * @param prefix awalan invoice (default 'INV')
 */
export function generateInvoice(prefix = 'INV'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${d}-${rand}`;
}

/** Format tanggal ke string YYYY-MM-DD untuk value input[type=date] */
export function toDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
