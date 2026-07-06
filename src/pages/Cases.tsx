import { useState } from 'react';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { formatCurrency } from '../lib/format';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardClass,
  inputClass,
} from '../lib/ui';

export function Cases() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const addCase = useAppStore((s) => s.addCase);
  const renameCase = useAppStore((s) => s.renameCase);
  const deleteCase = useAppStore((s) => s.deleteCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);

  const [newCaseName, setNewCaseName] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Casos</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Cada caso es un presupuesto independiente (por ejemplo: "Ahora" vs. "Con
          hipoteca"). Duplica uno para comparar escenarios sin perder el original.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {cases.map((c) => {
          const totals = caseTotals(c);
          const isActive = c.id === activeCaseId;
          return (
            <div
              key={c.id}
              className={`${cardClass} flex flex-wrap items-center gap-3 ${
                isActive ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <input
                className={`${inputClass} max-w-xs font-medium`}
                value={c.name}
                onChange={(e) => renameCase(c.id, e.target.value)}
              />
              <span className="text-sm text-neutral-400 tabular-nums">
                Ahorro: {formatCurrency(totals.monthlySavings)} / mes
              </span>
              <div className="ml-auto flex gap-2">
                {!isActive && (
                  <button
                    className={buttonSecondaryClass}
                    type="button"
                    onClick={() => setActiveCase(c.id)}
                  >
                    Activar
                  </button>
                )}
                <button
                  className={buttonSecondaryClass}
                  type="button"
                  onClick={() => {
                    const name = prompt('Nombre del nuevo caso duplicado:', `${c.name} (copia)`);
                    if (name?.trim()) addCase(name.trim(), c.id);
                  }}
                >
                  Duplicar
                </button>
                <button
                  className={buttonDangerClass}
                  type="button"
                  onClick={() => {
                    if (cases.length <= 1) {
                      alert('No puedes eliminar el único caso existente.');
                      return;
                    }
                    if (confirm(`¿Eliminar el caso "${c.name}" y su histórico?`)) {
                      deleteCase(c.id);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <section className={`${cardClass} flex items-center gap-2`}>
        <input
          className={inputClass}
          placeholder="Nombre del nuevo caso (ej. Sin hipoteca)"
          value={newCaseName}
          onChange={(e) => setNewCaseName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newCaseName.trim()) {
              addCase(newCaseName.trim());
              setNewCaseName('');
            }
          }}
        />
        <button
          className={buttonPrimaryClass}
          type="button"
          onClick={() => {
            if (!newCaseName.trim()) return;
            addCase(newCaseName.trim());
            setNewCaseName('');
          }}
        >
          Crear caso vacío
        </button>
      </section>
    </div>
  );
}
