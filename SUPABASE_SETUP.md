# Panduan Setup Supabase — Sistem Apotek

## 1. Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login
2. Klik **New project**
3. Pilih organisasi, beri nama project (contoh: `sistem-apotek`), pilih region terdekat
4. Catat **Password** database Anda
5. Tunggu project selesai dibuat (~2 menit)

---

## 2. Dapatkan Credentials

Buka **Project Settings → API**:

| Key | Digunakan untuk |
|-----|----------------|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon public** | `VITE_SUPABASE_ANON_KEY` |

> ⚠️ Jangan gunakan `service_role` key di frontend — key ini memiliki akses penuh dan tidak aman jika diekspos.

---

## 3. Isi File `.env`

Edit file `.env` di root project:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Jalankan SQL Schema

1. Buka **SQL Editor** di dashboard Supabase
2. Klik **New query**
3. Buka file `supabase_schema.sql` di root project
4. Copy seluruh isinya → Paste ke SQL Editor
5. Klik **Run** (atau Ctrl+Enter)

Script ini akan membuat:
- Tabel `suppliers`, `medicines`, `sales`, `sale_items`, `stock_activities`, `settings`
- Index untuk performa query
- Trigger `updated_at` otomatis
- Row Level Security (RLS) dengan policy anon access

---

## 5. Verifikasi Tabel

Buka **Table Editor** di Supabase — pastikan 6 tabel sudah terbuat:

```
✅ suppliers
✅ medicines
✅ sales
✅ sale_items
✅ stock_activities
✅ settings
```

---

## 6. Jalankan Aplikasi

```bash
npm run dev
```

Saat pertama kali dijalankan:
1. Aplikasi menampilkan data dari **localStorage** (cache) secara instan
2. Di background, aplikasi **terhubung ke Supabase** dan meng-upload data seed awal
3. Status koneksi ditampilkan di Topbar kanan:
   - 🔵 **Sinkronisasi...** — sedang loading dari Supabase
   - ✅ **Tersinkron** — berhasil terhubung, data dari Supabase
   - 🟡 **Offline** — Supabase tidak tersedia, data dari localStorage

---

## 7. Alur Data

```
User Action (tambah obat, transaksi, dll.)
    │
    ▼
State React (update instan, UI responsif)
    │
    ├──▶ localStorage (cache offline)
    │
    └──▶ Supabase (jika koneksi tersedia)
```

Jika Supabase tidak tersedia (misal saat dev offline), semua operasi tetap berjalan menggunakan localStorage. Data akan otomatis ter-upload saat koneksi tersedia di restart berikutnya via `seedIfEmpty()`.

---

## 8. Struktur Tabel

### `suppliers`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | text PK | Format: `SUP-xxxxxx` |
| nama | text | Nama perusahaan supplier |
| kontak | text | Nama PIC |
| telepon | text | Nomor telepon |
| alamat | text | Alamat lengkap |
| total_pembelian | bigint | Total nilai pembelian (Rp) |
| status | text | `aktif` / `nonaktif` |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto (trigger) |

### `medicines`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | text PK | Format: `MED-xxxxxx` |
| nama | text | Nama obat |
| kategori | text | Kategori obat |
| satuan | text | Tablet / Kapsul / dll |
| harga_beli | bigint | Harga beli (Rp) |
| harga_jual | bigint | Harga jual (Rp) |
| stok | integer | Jumlah stok saat ini |
| expired_date | date | Tanggal kedaluwarsa |
| supplier_id | text FK | Referensi ke `suppliers.id` |

### `sales`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | text PK | Format: `TRX-xxxxxx` |
| invoice | text UNIQUE | Nomor invoice |
| tanggal | timestamptz | Waktu transaksi |
| total | bigint | Total setelah pajak |
| pajak_persen | numeric | % pajak saat transaksi |
| pajak_amount | bigint | Nilai nominal pajak |
| metode_pembayaran | text | Tunai / QRIS / dll |
| kasir | text | Nama kasir |

### `sale_items`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | uuid PK | Auto generated |
| sale_id | text FK | Referensi ke `sales.id` (CASCADE DELETE) |
| medicine_id | text | ID obat |
| nama | text | Nama obat saat transaksi |
| harga | bigint | Harga per unit |
| qty | integer | Jumlah dibeli |
| subtotal | bigint | `harga × qty` |

### `stock_activities`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | text PK | Format: `STK-xxxxxxxxxx` |
| tanggal | timestamptz | Waktu aktivitas |
| medicine_id | text | ID obat |
| nama_obat | text | Nama obat |
| jenis | text | `masuk` / `keluar` / `penyesuaian` |
| jumlah | integer | Jumlah (negatif untuk penyesuaian pengurangan) |
| keterangan | text | Catatan |
| user_name | text | Nama user yang melakukan |

### `settings`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | integer PK | Selalu = 1 (single row) |
| data | jsonb | Seluruh pengaturan apotek |
| updated_at | timestamptz | Auto (trigger) |

---

## 9. Keamanan (RLS)

Script SQL sudah mengkonfigurasi Row Level Security dengan policy **anon access** (baca/tulis tanpa login).

Jika nanti ingin menambahkan autentikasi user:
1. Buat user di **Authentication → Users** Supabase
2. Ubah policy RLS agar hanya `auth.uid() IS NOT NULL`
3. Implementasikan login di aplikasi menggunakan `supabase.auth.signInWithPassword()`

---

## 10. Troubleshooting

### Status "Offline" terus-menerus
- Cek apakah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di `.env` sudah benar
- Pastikan tidak ada spasi ekstra di awal/akhir nilai
- Restart dev server setelah mengubah `.env`: `npm run dev`

### Error "relation does not exist"
- SQL schema belum dijalankan — ikuti langkah 4

### Data tidak muncul di Supabase Table Editor
- Buka **Table Editor → Settings** dan pastikan RLS tidak memblokir — periksa apakah policy sudah dibuat

### Duplicate key error saat seed
- Normal terjadi jika seed dijalankan lebih dari sekali — `seedIfEmpty()` sudah mengecek apakah data ada sebelum insert
