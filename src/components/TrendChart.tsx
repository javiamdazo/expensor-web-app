import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency, formatMonthLabel } from '../lib/format';
import { STATUS, CATEGORICAL_LIGHT, CATEGORICAL_DARK } from '../lib/palette';
import { usePrefersDark } from '../lib/usePrefersDark';

export interface TrendPoint {
  month: string;
  ingresos: number;
  gastos: number;
  ahorro: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const dark = usePrefersDark();
  const gridColor = dark ? '#2c2c2a' : '#e1e0d9';
  const inkColor = dark ? '#c3c2b7' : '#52514e';
  const incomeColor = dark ? CATEGORICAL_DARK[0] : CATEGORICAL_LIGHT[0];

  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Registra meses en Histórico para ver la evolución de ingresos, gastos y ahorro.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={(m: string) => formatMonthLabel(m)}
          tick={{ fill: inkColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fill: inkColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(m) => formatMonthLabel(String(m))}
          contentStyle={{
            background: dark ? '#1a1a19' : '#fcfcfb',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            fontSize: 12,
            color: dark ? '#ffffff' : '#0b0b0b',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: inkColor }} />
        <Line
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke={incomeColor}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          name="Gastos"
          stroke={STATUS.critical}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="ahorro"
          name="Ahorro"
          stroke={STATUS.good}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
