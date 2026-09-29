-- ============================================================
--  SISTEM APOTEK — Supabase Schema
--  Jalankan seluruh script ini di SQL Editor Supabase
--  Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
-- uuid_generate_v4() untuk primary key otomatis
create extension if not exists "uuid-ossp";

-- ─── Tabel: suppliers ────────────────────────────────────────
create table if not exists public.suppliers (
  id               text        primary key default 'SUP-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  nama             text        not null,
  kontak           text        not null default '',
  telepon          text        not null default '',
  alamat           text        not null default '',
  total_pembelian  bigint      not null default 0,
  status           text        not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Tabel: medicines ────────────────────────────────────────
create table if not exists public.medicines (
  id            text        primary key default 'MED-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  nama          text        not null,
  kategori      text        not null default '',
  satuan        text        not null default 'Tablet',
  harga_beli    bigint      not null default 0,
  harga_jual    bigint      not null default 0,
  stok          integer     not null default 0,
  expired_date  date        not null,
  supplier_id   text        references public.suppliers(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Tabel: sales ────────────────────────────────────────────
create table if not exists public.sales (
  id                 text        primary key default 'TRX-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
  invoice            text        not null unique,
  tanggal            timestamptz not null default now(),
  total              bigint      not null default 0,
  pajak_persen       numeric     not null default 0,
  pajak_amount       bigint      not null default 0,
  metode_pembayaran  text        not null default 'Tunai',
  kasir              text        not null default 'Admin Apotek',
  created_at         timestamptz not null default now()
);

-- ─── Tabel: sale_items ───────────────────────────────────────
create table if not exists public.sale_items (
  id           uuid    primary key default gen_random_uuid(),
  sale_id      text    not null references public.sales(id) on delete cascade,
  medicine_id  text    not null,
  nama         text    not null,
  harga        bigint  not null default 0,
  qty          integer not null default 1,
  subtotal     bigint  not null default 0
);

-- ─── Tabel: stock_activities ─────────────────────────────────
create table if not exists public.stock_activities (
  id           text        primary key default 'STK-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  tanggal      timestamptz not null default now(),
  medicine_id  text        not null,
  nama_obat    text        not null,
  jenis        text        not null check (jenis in ('masuk', 'keluar', 'penyesuaian')),
  jumlah       integer     not null,
  keterangan   text        not null default '',
  user_name    text        not null default 'Admin Apotek',
  created_at   timestamptz not null default now()
);

-- ─── Tabel: settings ─────────────────────────────────────────
-- Single-row config (id selalu 1)
create table if not exists public.settings (
  id          integer     primary key default 1 check (id = 1),
  data        jsonb       not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Pastikan hanya ada satu baris
insert into public.settings (id, data) values (1, '{}')
  on conflict (id) do nothing;

-- ─── Trigger: updated_at otomatis ────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

create or replace trigger trg_medicines_updated_at
  before update on public.medicines
  for each row execute function public.set_updated_at();

create or replace trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ─── Index untuk performa query ──────────────────────────────
create index if not exists idx_medicines_supplier on public.medicines(supplier_id);
create index if not exists idx_medicines_kategori on public.medicines(kategori);
create index if not exists idx_sale_items_sale    on public.sale_items(sale_id);
create index if not exists idx_sale_items_med     on public.sale_items(medicine_id);
create index if not exists idx_stock_med          on public.stock_activities(medicine_id);
create index if not exists idx_sales_tanggal      on public.sales(tanggal desc);
create index if not exists idx_stock_tanggal      on public.stock_activities(tanggal desc);

-- ─── Row Level Security (RLS) ────────────────────────────────
-- Aktifkan RLS di semua tabel
alter table public.suppliers        enable row level security;
alter table public.medicines        enable row level security;
alter table public.sales            enable row level security;
alter table public.sale_items       enable row level security;
alter table public.stock_activities enable row level security;
alter table public.settings         enable row level security;

-- Policy: izinkan anon key untuk SELECT, INSERT, UPDATE, DELETE
-- (Aplikasi ini belum memiliki auth user — gunakan anon access penuh)
-- Sesuaikan policy ini jika nanti menambahkan auth.

create policy "anon_select_suppliers"   on public.suppliers        for select using (true);
create policy "anon_insert_suppliers"   on public.suppliers        for insert with check (true);
create policy "anon_update_suppliers"   on public.suppliers        for update using (true);
create policy "anon_delete_suppliers"   on public.suppliers        for delete using (true);

create policy "anon_select_medicines"   on public.medicines        for select using (true);
create policy "anon_insert_medicines"   on public.medicines        for insert with check (true);
create policy "anon_update_medicines"   on public.medicines        for update using (true);
create policy "anon_delete_medicines"   on public.medicines        for delete using (true);

create policy "anon_select_sales"       on public.sales            for select using (true);
create policy "anon_insert_sales"       on public.sales            for insert with check (true);
create policy "anon_update_sales"       on public.sales            for update using (true);
create policy "anon_delete_sales"       on public.sales            for delete using (true);

create policy "anon_select_sale_items"  on public.sale_items       for select using (true);
create policy "anon_insert_sale_items"  on public.sale_items       for insert with check (true);
create policy "anon_delete_sale_items"  on public.sale_items       for delete using (true);

create policy "anon_select_stock"       on public.stock_activities for select using (true);
create policy "anon_insert_stock"       on public.stock_activities for insert with check (true);
create policy "anon_delete_stock"       on public.stock_activities for delete using (true);

create policy "anon_select_settings"    on public.settings         for select using (true);
create policy "anon_insert_settings"    on public.settings         for insert with check (true);
create policy "anon_update_settings"    on public.settings         for update using (true);
