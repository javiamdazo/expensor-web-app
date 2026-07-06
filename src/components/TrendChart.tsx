import { formatMonthLabel } from '../lib/format';

export interface TrendPoint {
  month: string;
  ingresos: number;
  gastos: number;
  ahorro: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Registra meses en Histórico para ver la evolución de ingresos y gastos.
      </p>
    );
  }

  const max = Math.max(...data.flatMap((d) => [d.ingresos, d.gastos]), 1);
  const barHeight = (v: number) => Math.max(10, (v / max) * 80);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-end gap-7 px-2" style={{ height: 120 }}>
        {data.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-end gap-1.5" style={{ height: 80 }}>
              <div
                title="Ingresos"
                className="w-[34px] rounded-t bg-positive"
                style={{ height: barHeight(d.ingresos) }}
              />
              <div
                title="Gastos"
                className="w-[34px] rounded-t bg-negative"
                style={{ height: barHeight(d.gastos) }}
              />
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {formatMonthLabel(d.month)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-5 border-t border-border pt-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="inline-block size-[9px] rounded-full bg-positive" />
          Ingresos
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="inline-block size-[9px] rounded-full bg-negative" />
          Gastos
        </div>
      </div>
    </div>
  );
}
