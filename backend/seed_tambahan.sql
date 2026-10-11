-- ============================================================
--  SISTEM APOTEK ΓÇö Seed Data Tambahan
--  Data contoh: sales, sale_items, stock_activities
--  Jalankan SETELAH seed.sql
-- ============================================================

-- ΓöÇΓöÇΓöÇ Sales (transaksi contoh) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
insert into public.sales (id, invoice, tanggal, total, pajak_persen, pajak_amount, metode_pembayaran, kasir) values
  ('TRX-001', 'INV-20260929-1001', now() - interval '0 days' + interval '8 hours 15 minutes',  11000, 0, 0, 'Tunai',  'Admin Apotek'),
  ('TRX-002', 'INV-20260929-1002', now() - interval '0 days' + interval '9 hours 30 minutes',  22000, 0, 0, 'QRIS',   'Admin Apotek'),
  ('TRX-003', 'INV-20260929-1003', now() - interval '0 days' + interval '10 hours 45 minutes', 36000, 0, 0, 'Tunai',  'Admin Apotek'),
  ('TRX-004', 'INV-20260929-1004', now() - interval '0 days' + interval '11 hours 20 minutes', 15500, 0, 0, 'Debit',  'Admin Apotek'),
  ('TRX-005', 'INV-20260928-1005', now() - interval '1 days' + interval '14 hours 10 minutes', 70500, 0, 0, 'QRIS',   'Admin Apotek'),
  ('TRX-006', 'INV-20260928-1006', now() - interval '1 days' + interval '16 hours 0 minutes',  30000, 0, 0, 'Tunai',  'Admin Apotek'),
  ('TRX-007', 'INV-20260927-1007', now() - interval '2 days' + interval '9 hours 0 minutes',   11000, 0, 0, 'Tunai',  'Admin Apotek'),
  ('TRX-008', 'INV-20260927-1008', now() - interval '2 days' + interval '13 hours 30 minutes', 60000, 0, 0, 'Debit',  'Admin Apotek')
on conflict (id) do nothing;

-- ΓöÇΓöÇΓöÇ Sale Items ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
insert into public.sale_items (id, sale_id, medicine_id, nama, harga, qty, subtotal) values
  (gen_random_uuid(), 'TRX-001', 'MED-001', 'Paracetamol 500mg',       300,  20, 6000),
  (gen_random_uuid(), 'TRX-001', 'MED-004', 'Vitamin C 1000mg',        1000, 5,  5000),
  (gen_random_uuid(), 'TRX-002', 'MED-003', 'Ibuprofen 400mg',         400,  10, 4000),
  (gen_random_uuid(), 'TRX-002', 'MED-013', 'Cough Syrup 100ml',       9000, 2,  18000),
  (gen_random_uuid(), 'TRX-003', 'MED-011', 'Metformin 500mg',         1200, 30, 36000),
  (gen_random_uuid(), 'TRX-004', 'MED-010', 'Loratadine 10mg',         800,  10, 8000),
  (gen_random_uuid(), 'TRX-004', 'MED-002', 'Amoxicillin 500mg',       1500, 5,  7500),
  (gen_random_uuid(), 'TRX-005', 'MED-016', 'Multivitamin Syrup 200ml',22000,3,  66000),
  (gen_random_uuid(), 'TRX-005', 'MED-001', 'Paracetamol 500mg',       300,  15, 4500),
  (gen_random_uuid(), 'TRX-006', 'MED-014', 'Povidone Iodine 10%',     15000,2,  30000),
  (gen_random_uuid(), 'TRX-007', 'MED-009', 'Asam Mefenamat 500mg',    350,  20, 7000),
  (gen_random_uuid(), 'TRX-007', 'MED-017', 'Attapulgite 500mg',       400,  10, 4000),
  (gen_random_uuid(), 'TRX-008', 'MED-012', 'Amlodipine 5mg',          1400, 30, 42000),
  (gen_random_uuid(), 'TRX-008', 'MED-018', 'Bisoprolol 5mg',          1800, 10, 18000);

-- ΓöÇΓöÇΓöÇ Stock Activities ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
insert into public.stock_activities (id, tanggal, medicine_id, nama_obat, jenis, jumlah, keterangan, user_name) values
  ('STK-001', now() - interval '0 days' + interval '7 hours',  'MED-001', 'Paracetamol 500mg',       'masuk',       200,  'Pembelian dari PT Kimia Farma',   'Admin Apotek'),
  ('STK-002', now() - interval '0 days' + interval '8 hours',  'MED-001', 'Paracetamol 500mg',       'keluar',      20,   'Penjualan INV-20260929-1001',     'Admin Apotek'),
  ('STK-003', now() - interval '0 days' + interval '9 hours',  'MED-013', 'Cough Syrup 100ml',       'keluar',      2,    'Penjualan INV-20260929-1002',     'Admin Apotek'),
  ('STK-004', now() - interval '1 days' + interval '10 hours', 'MED-016', 'Multivitamin Syrup 200ml','masuk',       50,   'Pembelian dari PT Kimia Farma',   'Admin Apotek'),
  ('STK-005', now() - interval '1 days' + interval '11 hours', 'MED-006', 'Omeprazole 20mg',         'penyesuaian', -5,   'Stok rusak/expired',              'Admin Apotek'),
  ('STK-006', now() - interval '1 days' + interval '14 hours', 'MED-016', 'Multivitamin Syrup 200ml','keluar',      3,    'Penjualan INV-20260928-1005',     'Admin Apotek'),
  ('STK-007', now() - interval '2 days' + interval '8 hours',  'MED-011', 'Metformin 500mg',         'masuk',       100,  'Pembelian dari PT Dexa Medica',   'Admin Apotek'),
  ('STK-008', now() - interval '2 days' + interval '13 hours', 'MED-012', 'Amlodipine 5mg',          'keluar',      30,   'Penjualan INV-20260927-1008',     'Admin Apotek'),
  ('STK-009', now() - interval '3 days' + interval '9 hours',  'MED-004', 'Vitamin C 1000mg',        'penyesuaian', -3,   'Koreksi stok opname',             'Admin Apotek'),
  ('STK-010', now() - interval '3 days' + interval '14 hours', 'MED-015', 'Hydrocortisone Cream 1%', 'penyesuaian', -10,  'Produk expired',                  'Admin Apotek'),
  ('STK-011', now() - interval '4 days' + interval '10 hours', 'MED-005', 'Cetirizine 10mg',         'masuk',       75,   'Pembelian dari PT Kalbe Farma',   'Admin Apotek'),
  ('STK-012', now() - interval '4 days' + interval '15 hours', 'MED-020', 'Ibuprofen Syrup 100ml',   'masuk',       22,   'Pembelian dari PT Kimia Farma',   'Admin Apotek')
on conflict (id) do nothing;
