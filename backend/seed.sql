-- ============================================================
--  SISTEM APOTEK — Seed Data Utama
--  Data awal: suppliers dan medicines
--  Jalankan SETELAH schema.sql
-- ============================================================

-- ─── Suppliers ───────────────────────────────────────────────
insert into public.suppliers (id, nama, kontak, telepon, alamat, total_pembelian, status) values
  ('SUP-001', 'PT Kimia Farma Tbk',     'Budi Santoso', '021-5551-2345', 'Jl. Veteran No. 9, Jakarta Pusat',                    125000000, 'aktif'),
  ('SUP-002', 'PT Kalbe Farma Tbk',     'Siti Rahayu',  '021-5552-6789', 'Jl. Jend. Gatot Subroto Kav. 88, Jakarta Selatan',    98000000,  'aktif'),
  ('SUP-003', 'PT Dexa Medica',         'Andi Wijaya',  '031-5553-1122', 'Jl. Babarsari No. 2, Yogyakarta',                     54000000,  'aktif'),
  ('SUP-004', 'PT Tempo Scan Pacific',  'Dewi Lestari', '021-5554-3344', 'Jl. Dewi Sartika Raya No. 17, Jakarta Timur',         42000000,  'aktif'),
  ('SUP-005', 'PT Sanbe Farma',         'Rudi Hartono', '022-5555-5566', 'Jl. Soekarno Hatta No. 543, Bandung',                 28500000,  'nonaktif')
on conflict (id) do nothing;

-- ─── Medicines ───────────────────────────────────────────────
insert into public.medicines (id, nama, kategori, satuan, harga_beli, harga_jual, stok, expired_date, supplier_id) values
  ('MED-001', 'Paracetamol 500mg',        'Analgetik',      'Tablet', 150,   300,   320, '2027-06-30', 'SUP-001'),
  ('MED-002', 'Amoxicillin 500mg',        'Antibiotik',     'Kapsul', 800,   1500,  18,  '2026-03-15', 'SUP-002'),
  ('MED-003', 'Ibuprofen 400mg',          'Analgetik',      'Tablet', 200,   400,   150, '2027-01-20', 'SUP-001'),
  ('MED-004', 'Vitamin C 1000mg',         'Vitamin',        'Tablet', 500,   1000,  8,   '2026-12-10', 'SUP-003'),
  ('MED-005', 'Cetirizine 10mg',          'Antihistamin',   'Tablet', 300,   600,   75,  '2027-04-25', 'SUP-002'),
  ('MED-006', 'Omeprazole 20mg',          'Antasida',       'Kapsul', 1200,  2500,  0,   '2026-08-30', 'SUP-004'),
  ('MED-007', 'Ranitidine 150mg',         'Antasida',       'Tablet', 250,   500,   200, '2027-02-14', 'SUP-003'),
  ('MED-008', 'Salbutamol 2mg',           'Bronkodilator',  'Tablet', 350,   700,   12,  '2026-11-05', 'SUP-002'),
  ('MED-009', 'Asam Mefenamat 500mg',     'Analgetik',      'Tablet', 180,   350,   95,  '2027-03-18', 'SUP-001'),
  ('MED-010', 'Loratadine 10mg',          'Antihistamin',   'Tablet', 400,   800,   60,  '2027-05-22', 'SUP-004'),
  ('MED-011', 'Metformin 500mg',          'Antidiabetik',   'Tablet', 600,   1200,  130, '2027-07-11', 'SUP-003'),
  ('MED-012', 'Amlodipine 5mg',           'Antihipertensi', 'Tablet', 700,   1400,  15,  '2026-10-30', 'SUP-002'),
  ('MED-013', 'Cough Syrup 100ml',        'Batuk',          'Botol',  5000,  9000,  40,  '2026-09-15', 'SUP-001'),
  ('MED-014', 'Povidone Iodine 10%',      'Antiseptik',     'Botol',  8000,  15000, 25,  '2027-08-20', 'SUP-004'),
  ('MED-015', 'Hydrocortisone Cream 1%',  'Dermatologi',    'Tube',   6000,  12000, 0,   '2026-05-10', 'SUP-005'),
  ('MED-016', 'Multivitamin Syrup 200ml', 'Vitamin',        'Botol',  12000, 22000, 55,  '2027-01-30', 'SUP-001'),
  ('MED-017', 'Attapulgite 500mg',        'Antidiare',      'Tablet', 200,   400,   85,  '2027-06-12', 'SUP-002'),
  ('MED-018', 'Bisoprolol 5mg',           'Antihipertensi', 'Tablet', 900,   1800,  5,   '2026-12-25', 'SUP-003'),
  ('MED-019', 'Glimepiride 2mg',          'Antidiabetik',   'Tablet', 1100,  2200,  48,  '2027-04-08', 'SUP-002'),
  ('MED-020', 'Ibuprofen Syrup 100ml',    'Analgetik',      'Botol',  4500,  8500,  22,  '2026-11-18', 'SUP-001')
on conflict (id) do nothing;

-- ─── Settings default ─────────────────────────────────────────
insert into public.settings (id, data) values (1, '{}')
on conflict (id) do nothing;
