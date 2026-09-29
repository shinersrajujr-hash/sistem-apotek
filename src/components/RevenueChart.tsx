interface BarChartProps {
  data: { tanggal: string; pendapatan: number }[];
  height?: number;
}

export default function RevenueChart({ data, height = 220 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.pendapatan));
  const padding = 40;
  const chartHeight = height - padding;
  const barWidth = 100 / data.length;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height }}>
        <div className="flex flex-col justify-between text-xs text-gray-400 pr-2" style={{ height: chartHeight }}>
          <span>{formatShort(max)}</span>
          <span>{formatShort(max * 0.5)}</span>
          <span>0</span>
        </div>
        <div className="flex-1 flex items-end justify-between gap-1.5 sm:gap-3 relative" style={{ height }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-gray-100" />
            <div className="border-t border-gray-100" />
            <div className="border-t border-gray-100" />
          </div>
          {data.map((d, i) => {
            const h = (d.pendapatan / max) * chartHeight;
            const isLast = i === data.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end relative group z-10">
                <div
                  className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 cursor-pointer ${
                    isLast ? 'bg-teal-600' : 'bg-teal-200 hover:bg-teal-300'
                  }`}
                  style={{ height: Math.max(h, 4) }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium pointer-events-none z-20">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(d.pendapatan)}
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-2 font-medium">{d.tanggal}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatShort(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `${Math.round(n / 1000)}rb`;
  return String(n);
}
