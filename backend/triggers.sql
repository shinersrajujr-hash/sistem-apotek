-- ============================================================
--  SISTEM APOTEK — Triggers & Functions
--  Otomatisasi updated_at pada setiap UPDATE
--  Jalankan SETELAH schema.sql
-- ============================================================

-- ─── Function: set_updated_at ────────────────────────────────
-- Dipanggil oleh semua trigger di bawah.
-- Mengisi kolom updated_at dengan waktu sekarang secara otomatis.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Trigger: suppliers ──────────────────────────────────────
create or replace trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row
  execute function public.set_updated_at();

-- ─── Trigger: medicines ──────────────────────────────────────
create or replace trigger trg_medicines_updated_at
  before update on public.medicines
  for each row
  execute function public.set_updated_at();

-- ─── Trigger: settings ───────────────────────────────────────
create or replace trigger trg_settings_updated_at
  before update on public.settings
  for each row
  execute function public.set_updated_at();
