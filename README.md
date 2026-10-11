# Sistem Apotek Sehat Sentosa

Sistem manajemen apotek berbasis web untuk mengelola data obat, transaksi penjualan, stok, supplier, dan laporan keuangan secara terintegrasi dengan database Supabase.

**Demo web: [Buka Sistem Apotek](https://shinersrajujr-hash.github.io/sistem-apotek/)**

> Aplikasi di-host secara publik melalui GitHub Pages dan terhubung langsung ke database Supabase. Semua data yang diinput akan tersimpan secara permanen di cloud.

---

## Fitur Utama

- **Dashboard** ΓÇö Ringkasan pendapatan, transaksi, stok menipis, dan grafik penjualan harian
- **Penjualan (POS)** ΓÇö Kasir dengan keranjang belanja, pajak otomatis, dan cetak struk
- **Data Obat** ΓÇö CRUD lengkap dengan filter kategori dan status stok
- **Manajemen Stok** ΓÇö Pencatatan stok masuk, keluar, dan penyesuaian
- **Supplier** ΓÇö Kelola data supplier dengan jumlah obat otomatis
- **Laporan** ΓÇö Analisis penjualan per periode, ekspor CSV, obat terlaris
- **Pengaturan** ΓÇö Konfigurasi profil apotek, pajak, prefix invoice, metode pembayaran

---

## Struktur Folder

```
≡ƒôü backend/
   Γö£ΓöÇΓöÇ schema.sql          ΓÇö Definisi tabel, index, dan Row Level Security
   Γö£ΓöÇΓöÇ seed.sql            ΓÇö Data awal suppliers dan medicines
   Γö£ΓöÇΓöÇ seed_tambahan.sql   ΓÇö Data contoh transaksi dan aktivitas stok
   ΓööΓöÇΓöÇ triggers.sql        ΓÇö Function dan trigger otomatis updated_at
≡ƒôü frontend/
   Γö£ΓöÇΓöÇ index.html          ΓÇö Halaman utama aplikasi
   Γö£ΓöÇΓöÇ script.js           ΓÇö Seluruh logika aplikasi (React + Supabase)
   ΓööΓöÇΓöÇ style.css           ΓÇö Seluruh styling (Tailwind CSS)
≡ƒôä index.html              ΓÇö Entry point GitHub Pages
```

---

## Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Build Tool | Vite |
| Database | Supabase (PostgreSQL) |
| Hosting | GitHub Pages |

---

## Setup Database

Jalankan file SQL berikut secara berurutan di **Supabase SQL Editor**:

1. `backend/schema.sql` ΓÇö buat semua tabel
2. `backend/triggers.sql` ΓÇö buat trigger otomatis
3. `backend/seed.sql` ΓÇö isi data awal
4. `backend/seed_tambahan.sql` ΓÇö isi data contoh transaksi
