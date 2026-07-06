import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { currentMonth, formatCurrency, formatMonthLabel, parseFlexibleNumber } from '../lib/format';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  cardClass,
  inputClass,
} from '../lib/ui';

function AmountInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(value.toString());
  return (
    <input
      className={`${inputClass} w-28 text-right tabular-nums`}
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
    return <p className="text-sm text-neutral-500">Selecciona o crea un caso primero.</p>;
  }

  const entries = history
    .filter((h) => h.caseId === activeCase.id)
    .sort((a, b) => b.month.localeCompare(a.month));

  const monthTaken = entries.some((e) => e.month === month);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Histórico · {activeCase.name}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Registra los importes reales de cada mes para comparar con el presupuesto.
        </p>
      </div>

      <section className={`${cardClass} flex flex-wrap items-center gap-2`}>
        <input
          type="month"
          className={`${inputClass} w-auto`}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button
          className={buttonPrimaryClass}
          type="button"
          disabled={monthTaken}
          onClick={() => addHistoryEntry(activeCase.id, month)}
        >
          {monthTaken ? 'Ese mes ya existe' : 'Crear mes a partir del presupuesto'}
        </button>
      </section>

      {entries.length === 0 && (
        <p className="text-sm text-neutral-400">Todavía no hay meses registrados para este caso.</p>
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

        return (
          <details key={entry.id} className={cardClass}>
            <summary className="flex cursor-pointer flex-wrap items-center gap-3">
              <span className="font-semibold">{formatMonthLabel(entry.month)}</span>
              <span className="text-sm text-[#0ca30c] tabular-nums">
                +{formatCurrency(totalIngresos)}
              </span>
              <span className="text-sm text-[#d03b3b] tabular-nums">
                -{formatCurrency(totalGastos)}
              </span>
              <span
                className={`text-sm font-medium tabular-nums ${
                  totalIngresos - totalGastos >= 0 ? 'text-[#0ca30c]' : 'text-[#d03b3b]'
                }`}
              >
                = {formatCurrency(totalIngresos - totalGastos)}
              </span>
              <button
                type="button"
                className={`${buttonDangerClass} ml-auto`}
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm(`¿Eliminar el mes ${formatMonthLabel(entry.month)}?`)) {
                    deleteHistoryEntry(entry.id);
                  }
                }}
              >
                Eliminar mes
              </button>
            </summary>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                  Ingresos reales
                </h3>
                <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
                  {ingresoLines.map((l) => (
                    <div key={l.index} className="flex items-center gap-2 py-1.5">
                      <span className="flex-1 text-sm">{l.concept}</span>
                      <AmountInput
                        value={l.amount}
                        onCommit={(n) => updateHistoryLine(entry.id, l.index, { amount: n })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                  Gastos reales
                </h3>
                <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
                  {gastoLines.map((l) => (
                    <div key={l.index} className="flex items-center gap-2 py-1.5">
                      <span className="flex-1 text-sm">
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
              <label className="mb-1 block text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                Notas
              </label>
              <textarea
                className={inputClass}
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
