import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { currentMonth, formatCurrency, formatMonthLabel, parseFlexibleNumber } from '../lib/format';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

function AmountInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(value.toString());
  return (
    <Input
      className="w-full text-right"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const n = parseFlexibleNumber(text);
        setText(n.toString());
        onCommit(n);
      }}
      inputMode="decimal"
    />
  );
}

export function History() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const activeCase = cases.find((c) => c.id === activeCaseId);
  const history = useAppStore((s) => s.history);
  const addHistoryEntry = useAppStore((s) => s.addHistoryEntry);
  const updateHistoryLine = useAppStore((s) => s.updateHistoryLine);
  const updateHistoryNotes = useAppStore((s) => s.updateHistoryNotes);
  const deleteHistoryEntry = useAppStore((s) => s.deleteHistoryEntry);

  const [month, setMonth] = useState(currentMonth());

  if (!activeCase) {
    return <p className="text-sm text-muted-foreground">Selecciona o crea un caso primero.</p>;
  }

  const entries = history
    .filter((h) => h.caseId === activeCase.id)
    .sort((a, b) => b.month.localeCompare(a.month));

  const monthTaken = entries.some((e) => e.month === month);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold">Histórico · {activeCase.name}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Registra los importes reales de cada mes para comparar con el presupuesto.
        </p>
      </div>

      <Card className="flex flex-wrap items-center gap-3">
        <Input
          type="month"
          className="w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <Button
          variant={monthTaken ? 'secondary' : 'primary'}
          disabled={monthTaken}
          onClick={() => addHistoryEntry(activeCase.id, month)}
        >
          {monthTaken ? 'Ese mes ya existe' : 'Crear mes a partir del presupuesto'}
        </Button>
      </Card>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no hay meses registrados para este caso.
        </p>
      )}

      {entries.map((entry) => {
        const ingresoLines = entry.lines
          .map((l, i) => ({ ...l, index: i }))
          .filter((l) => l.section === 'ingreso');
        const gastoLines = entry.lines
          .map((l, i) => ({ ...l, index: i }))
          .filter((l) => l.section === 'gasto');
        const totalIngresos = ingresoLines.reduce((s, l) => s + l.amount, 0);
        const totalGastos = gastoLines.reduce((s, l) => s + l.amount, 0);
        const savings = totalIngresos - totalGastos;

        return (
          <details
            key={entry.id}
            className="rounded-lg border border-border bg-card px-[22px] py-5 text-card-foreground"
          >
            <summary className="flex cursor-pointer flex-wrap items-baseline gap-3">
                <span className="text-[17px] font-extrabold">{formatMonthLabel(entry.month)}</span>
                <span className="font-mono text-sm font-bold text-positive">
                  +{formatCurrency(totalIngresos)}
                </span>
                <span className="font-mono text-sm font-bold text-negative">
                  -{formatCurrency(totalGastos)}
                </span>
                <span
                  className={cn(
                    'font-mono text-sm font-extrabold',
                    savings >= 0 ? 'text-positive' : 'text-negative',
                  )}
                >
                  = {formatCurrency(savings)}
                </span>
                <Button
                  variant="ghostDanger"
                  className="ml-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm(`¿Eliminar el mes ${formatMonthLabel(entry.month)}?`)) {
                      deleteHistoryEntry(entry.id);
                    }
                  }}
                >
                  Eliminar mes
                </Button>
              </summary>

              <div className="mt-4.5 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-[12.5px] font-bold tracking-wide text-muted-foreground uppercase">
                    Ingresos reales
                  </h3>
                  <div className="flex flex-col">
                    {ingresoLines.map((l) => (
                      <div
                        key={l.index}
                        className="grid grid-cols-[1fr_100px] items-center gap-2.5 border-b border-border py-[7px] last:border-b-0"
                      >
                        <span className="text-[12.5px] text-foreground">{l.concept}</span>
                        <AmountInput
                          value={l.amount}
                          onCommit={(n) => updateHistoryLine(entry.id, l.index, { amount: n })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-[12.5px] font-bold tracking-wide text-muted-foreground uppercase">
                    Gastos reales
                  </h3>
                  <div className="flex flex-col">
                    {gastoLines.map((l) => (
                      <div
                        key={l.index}
                        className="grid grid-cols-[1fr_100px] items-center gap-2.5 border-b border-border py-[7px] last:border-b-0"
                      >
                        <span className="text-[12.5px] text-foreground">
                          {l.category} · {l.concept}
                        </span>
                        <AmountInput
                          value={l.amount}
                          onCommit={(n) => updateHistoryLine(entry.id, l.index, { amount: n })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-[12.5px] font-bold tracking-wide text-muted-foreground uppercase">
                  Notas
                </label>
                <Textarea
                  rows={2}
                  value={entry.notes}
                  onChange={(e) => updateHistoryNotes(entry.id, e.target.value)}
                />
              </div>
            </details>
        );
      })}
    </div>
  );
}
