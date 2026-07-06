import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../lib/format';
import { categoricalColor } from '../lib/palette';
import { usePrefersDark } from '../lib/usePrefersDark';

interface CategoryBreakdownChartProps {
  data: { name: string; monthly: number }[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const dark = usePrefersDark();
  const gridColor = dark ? '#2c2c2a' : '#e1e0d9';
  const inkColor = dark ? '#c3c2b7' : '#52514e';

  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Añade categorías de gasto en Presupuesto para ver el desglose.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.monthly - a.monthly);

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 42)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fill: inkColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: inkColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: dark ? '#1a1a19' : '#fcfcfb',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            fontSize: 12,
            color: dark ? '#ffffff' : '#0b0b0b',
          }}
        />
        <Bar dataKey="monthly" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {sorted.map((entry, index) => (
            <Cell key={entry.name} fill={categoricalColor(index, dark)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
