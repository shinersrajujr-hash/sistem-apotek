/**
 * Type definisi untuk Supabase database.
 * Dibuat secara manual agar sesuai dengan skema tabel yang kita buat di SQL.
 * Kolom menggunakan snake_case (konvensi PostgreSQL/Supabase).
 */

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string;
          nama: string;
          kontak: string;
          telepon: string;
          alamat: string;
          total_pembelian: number;
          status: 'aktif' | 'nonaktif';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
      };

      medicines: {
        Row: {
          id: string;
          nama: string;
          kategori: string;
          satuan: string;
          harga_beli: number;
          harga_jual: number;
          stok: number;
          expired_date: string;
          supplier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medicines']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['medicines']['Insert']>;
      };

      sales: {
        Row: {
          id: string;
          invoice: string;
          tanggal: string;
          total: number;
          pajak_persen: number;
          pajak_amount: number;
          metode_pembayaran: string;
          kasir: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };

      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          medicine_id: string;
          nama: string;
          harga: number;
          qty: number;
          subtotal: number;
        };
        Insert: Database['public']['Tables']['sale_items']['Row'];
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
      };

      stock_activities: {
        Row: {
          id: string;
          tanggal: string;
          medicine_id: string;
          nama_obat: string;
          jenis: 'masuk' | 'keluar' | 'penyesuaian';
          jumlah: number;
          keterangan: string;
          user_name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stock_activities']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['stock_activities']['Insert']>;
      };

      settings: {
        Row: {
          id: number;            // selalu 1 — single-row config
          data: Record<string, unknown>;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
}
