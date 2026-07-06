import { formatCurrency } from '../lib/format';
import { categoricalColor } from '../lib/palette';
import { useTheme } from '../lib/theme';

interface CategoryBreakdownChartProps {
  data: { name: string; monthly: number }[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Añade categorías de gasto en Presupuesto para ver el desglose.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => b.monthly - a.monthly);
  const max = Math.max(...sorted.map((c) => c.monthly), 1);

  return (
    <div className="flex flex-col gap-3.5">
      {sorted.map((cat, i) => (
        <div key={cat.name} className="grid grid-cols-[110px_1fr_80px] items-center gap-3">
          <div className="truncate text-[13px] font-semibold text-foreground">{cat.name}</div>
          <div className="h-2.5 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(cat.monthly / max) * 100}%`,
                background: categoricalColor(i, dark),
              }}
            />
          </div>
          <div className="text-right font-mono text-[12.5px] text-muted-foreground">
            {formatCurrency(cat.monthly)}
          </div>
        </div>
      ))}
    </div>
  );
}
