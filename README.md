# Sistem Apotek Sehat Sentosa

Sistem manajemen apotek berbasis web untuk mengelola data obat, transaksi penjualan, stok, supplier, dan laporan keuangan secara terintegrasi dengan database Supabase.

**Demo web: [Buka Sistem Apotek](https://shinersrajujr-hash.github.io/sistem-apotek/)**

> Aplikasi di-host secara publik melalui GitHub Pages dan terhubung langsung ke database Supabase. Semua data yang diinput akan tersimpan secara permanen di cloud.

---

## Fitur Utama

- **Dashboard** — Ringkasan pendapatan, transaksi, stok menipis, dan grafik penjualan harian
- **Penjualan (POS)** — Kasir dengan keranjang belanja, pajak otomatis, dan cetak struk
- **Data Obat** — CRUD lengkap dengan filter kategori dan status stok
- **Manajemen Stok** — Pencatatan stok masuk, keluar, dan penyesuaian
- **Supplier** — Kelola data supplier dengan jumlah obat otomatis
- **Laporan** — Analisis penjualan per periode, ekspor CSV, obat terlaris
- **Pengaturan** — Konfigurasi profil apotek, pajak, prefix invoice, metode pembayaran

---

## Struktur Folder

```
📁 backend/
   ├── schema.sql          — Definisi tabel, index, dan Row Level Security
   ├── seed.sql            — Data awal suppliers dan medicines
   ├── seed_tambahan.sql   — Data contoh transaksi dan aktivitas stok
   └── triggers.sql        — Function dan trigger otomatis updated_at
📁 frontend/
   ├── index.html          — Halaman utama aplikasi
   ├── script.js           — Seluruh logika aplikasi (React + Supabase)
   └── style.css           — Seluruh styling (Tailwind CSS)
📄 index.html              — Entry point GitHub Pages
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

1. `backend/schema.sql` — buat semua tabel
2. `backend/triggers.sql` — buat trigger otomatis
3. `backend/seed.sql` — isi data awal
4. `backend/seed_tambahan.sql` — isi data contoh transaksi
