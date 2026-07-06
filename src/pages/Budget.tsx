import { useState } from 'react';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { formatCurrency, parseFlexibleNumber } from '../lib/format';
import {
  buttonDangerClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
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

function NewItemRow({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string, amount: number) => void;
}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  function submit() {
    if (!name.trim()) return;
    onAdd(name.trim(), parseFlexibleNumber(amount));
    setName('');
    setAmount('');
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <input
        className={inputClass}
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <input
        className={`${inputClass} w-28 text-right`}
        placeholder="0,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        inputMode="decimal"
      />
      <button className={buttonSecondaryClass} onClick={submit} type="button">
        Añadir
      </button>
    </div>
  );
}

export function Budget() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const activeCase = cases.find((c) => c.id === activeCaseId);

  const addIncomeItem = useAppStore((s) => s.addIncomeItem);
  const updateIncomeItem = useAppStore((s) => s.updateIncomeItem);
  const deleteIncomeItem = useAppStore((s) => s.deleteIncomeItem);
  const addCategory = useAppStore((s) => s.addCategory);
  const renameCategory = useAppStore((s) => s.renameCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const addExpenseItem = useAppStore((s) => s.addExpenseItem);
  const updateExpenseItem = useAppStore((s) => s.updateExpenseItem);
  const deleteExpenseItem = useAppStore((s) => s.deleteExpenseItem);

  const [newCategoryName, setNewCategoryName] = useState('');

  if (!activeCase) {
    return <p className="text-sm text-neutral-500">Selecciona o crea un caso primero.</p>;
  }

  const totals = caseTotals(activeCase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Presupuesto · {activeCase.name}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Importes mensuales. El anual se calcula automáticamente (× 12).
        </p>
      </div>

      <section className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Ingresos
        </h2>
        <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
          {activeCase.income.map((inc) => (
            <div key={inc.id} className="flex items-center gap-2 py-1.5">
              <input
                className={inputClass}
                value={inc.name}
                onChange={(e) =>
                  updateIncomeItem(activeCase.id, inc.id, { name: e.target.value })
                }
              />
              <AmountInput
                value={inc.monthlyAmount}
                onCommit={(n) =>
                  updateIncomeItem(activeCase.id, inc.id, { monthlyAmount: n })
                }
              />
              <span className="w-28 text-right text-sm text-neutral-400 tabular-nums">
                {formatCurrency(inc.monthlyAmount * 12)}
              </span>
              <button
                className={buttonDangerClass}
                type="button"
                onClick={() => deleteIncomeItem(activeCase.id, inc.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <NewItemRow
          placeholder="Nuevo concepto de ingreso"
          onAdd={(name, amount) => addIncomeItem(activeCase.id, name, amount)}
        />
        <p className="mt-3 text-right text-sm font-medium tabular-nums">
          Total: {formatCurrency(totals.monthlyIncome)} / mes ·{' '}
          {formatCurrency(totals.annualIncome)} / año
        </p>
      </section>

      {activeCase.categories.map((cat) => {
        const catTotal = cat.items.reduce((s, it) => s + it.monthlyAmount, 0);
        return (
          <section key={cat.id} className={cardClass}>
            <div className="mb-2 flex items-center gap-2">
              <input
                className={`${inputClass} max-w-xs font-semibold`}
                value={cat.name}
                onChange={(e) => renameCategory(activeCase.id, cat.id, e.target.value)}
              />
              <button
                className={`${buttonDangerClass} ml-auto`}
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar la categoría "${cat.name}" y todos sus conceptos?`)) {
                    deleteCategory(activeCase.id, cat.id);
                  }
                }}
              >
                Eliminar categoría
              </button>
            </div>
            <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {cat.items.map((it) => (
                <div key={it.id} className="flex items-center gap-2 py-1.5">
                  <input
                    className={inputClass}
                    value={it.name}
                    onChange={(e) =>
                      updateExpenseItem(activeCase.id, cat.id, it.id, {
                        name: e.target.value,
                      })
                    }
                  />
                  <AmountInput
                    value={it.monthlyAmount}
                    onCommit={(n) =>
                      updateExpenseItem(activeCase.id, cat.id, it.id, {
                        monthlyAmount: n,
                      })
                    }
                  />
                  <span className="w-28 text-right text-sm text-neutral-400 tabular-nums">
                    {formatCurrency(it.monthlyAmount * 12)}
                  </span>
                  <button
                    className={buttonDangerClass}
                    type="button"
                    onClick={() => deleteExpenseItem(activeCase.id, cat.id, it.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <NewItemRow
              placeholder="Nuevo concepto de gasto"
              onAdd={(name, amount) => addExpenseItem(activeCase.id, cat.id, name, amount)}
            />
            <p className="mt-3 text-right text-sm font-medium tabular-nums">
              Total: {formatCurrency(catTotal)} / mes · {formatCurrency(catTotal * 12)} / año
            </p>
          </section>
        );
      })}

      <section className={`${cardClass} flex items-center gap-2`}>
        <input
          className={inputClass}
          placeholder="Nombre de la nueva categoría (ej. Ocio)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newCategoryName.trim()) {
              addCategory(activeCase.id, newCategoryName.trim());
              setNewCategoryName('');
            }
          }}
        />
        <button
          className={buttonPrimaryClass}
          type="button"
          onClick={() => {
            if (!newCategoryName.trim()) return;
            addCategory(activeCase.id, newCategoryName.trim());
            setNewCategoryName('');
          }}
        >
          Añadir categoría
        </button>
      </section>

      <div className={`${cardClass} flex justify-between text-sm font-semibold`}>
        <span>Gasto total</span>
        <span className="tabular-nums">
          {formatCurrency(totals.monthlyExpense)} / mes · {formatCurrency(totals.annualExpense)} / año
        </span>
      </div>
    </div>
  );
}
