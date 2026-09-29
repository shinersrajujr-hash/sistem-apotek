import type { ReactNode } from 'react';

interface BadgeProps {
  status: 'tersedia' | 'menipis' | 'habis' | 'aktif' | 'nonaktif' | 'masuk' | 'keluar' | 'penyesuaian';
  children?: ReactNode;
}

const styles: Record<string, string> = {
  tersedia: 'bg-teal-50 text-teal-700 border-teal-200',
  menipis: 'bg-amber-50 text-amber-700 border-amber-200',
  habis: 'bg-red-50 text-red-600 border-red-200',
  aktif: 'bg-teal-50 text-teal-700 border-teal-200',
  nonaktif: 'bg-gray-100 text-gray-500 border-gray-200',
  masuk: 'bg-green-50 text-green-700 border-green-200',
  keluar: 'bg-blue-50 text-blue-700 border-blue-200',
  penyesuaian: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function StatusBadge({ status, children }: BadgeProps) {
  const label = children ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'tersedia' || status === 'aktif' ? 'bg-teal-500' : status === 'menipis' ? 'bg-amber-500' : status === 'habis' ? 'bg-red-500' : status === 'masuk' ? 'bg-green-500' : status === 'keluar' ? 'bg-blue-500' : 'bg-purple-500'}`} />
      {label}
    </span>
  );
}
