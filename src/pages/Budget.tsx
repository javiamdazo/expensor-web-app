import { useState } from 'react';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { formatCurrency, parseFlexibleNumber } from '../lib/format';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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
      className="w-[130px] text-right"
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

function ItemRow({
  name,
  onRename,
  monthlyAmount,
  onAmountCommit,
  onDelete,
}: {
  name: string;
  onRename: (name: string) => void;
  monthlyAmount: number;
  onAmountCommit: (n: number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_130px_100px_70px] items-center gap-2.5 border-b border-border py-2.5 last:border-b-0">
      <Input value={name} onChange={(e) => onRename(e.target.value)} />
      <AmountInput value={monthlyAmount} onCommit={onAmountCommit} />
      <span className="text-right font-mono text-[12.5px] text-muted-foreground">
        {formatCurrency(monthlyAmount * 12)}
      </span>
      <Button variant="link" onClick={onDelete} className="justify-self-end">
        Eliminar
      </Button>
    </div>
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
    <div className="grid grid-cols-[1fr_130px_100px_70px] items-center gap-2.5 py-2.5">
      <Input
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <Input
        className="text-right"
        placeholder="0,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        inputMode="decimal"
      />
      <div />
      <Button variant="primary" size="sm" onClick={submit} className="justify-self-end">
        Añadir
      </Button>
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
    return <p className="text-sm text-muted-foreground">Selecciona o crea un caso primero.</p>;
  }

  const totals = caseTotals(activeCase);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold">Presupuesto · {activeCase.name}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Importes mensuales. El anual se calcula automáticamente (× 12).
        </p>
      </div>

      <Card>
        <CardTitle>Ingresos</CardTitle>
        <div className="mt-3.5 flex flex-col">
          {activeCase.income.map((inc) => (
            <ItemRow
              key={inc.id}
              name={inc.name}
              onRename={(name) => updateIncomeItem(activeCase.id, inc.id, { name })}
              monthlyAmount={inc.monthlyAmount}
              onAmountCommit={(n) =>
                updateIncomeItem(activeCase.id, inc.id, { monthlyAmount: n })
              }
              onDelete={() => deleteIncomeItem(activeCase.id, inc.id)}
            />
          ))}
          <NewItemRow
            placeholder="Nuevo concepto de ingreso"
            onAdd={(name, amount) => addIncomeItem(activeCase.id, name, amount)}
          />
        </div>
        <p className="mt-3 text-right font-mono text-[12.5px] text-muted-foreground">
          Total: {formatCurrency(totals.monthlyIncome)} / mes ·{' '}
          {formatCurrency(totals.annualIncome)} / año
        </p>
      </Card>

      {activeCase.categories.map((cat) => {
        const catTotal = cat.items.reduce((s, it) => s + it.monthlyAmount, 0);
        return (
          <Card key={cat.id}>
            <div className="flex items-center justify-between gap-2">
              <Input
                className="h-auto max-w-xs border-none bg-transparent p-0 text-[14.5px] font-bold shadow-none focus-visible:ring-0"
                value={cat.name}
                onChange={(e) => renameCategory(activeCase.id, cat.id, e.target.value)}
              />
              <Button
                variant="ghostDanger"
                onClick={() => {
                  if (confirm(`¿Eliminar la categoría "${cat.name}" y todos sus conceptos?`)) {
                    deleteCategory(activeCase.id, cat.id);
                  }
                }}
              >
                Eliminar categoría
              </Button>
            </div>
            <div className="mt-3.5 flex flex-col">
              {cat.items.map((it) => (
                <ItemRow
                  key={it.id}
                  name={it.name}
                  onRename={(name) =>
                    updateExpenseItem(activeCase.id, cat.id, it.id, { name })
                  }
                  monthlyAmount={it.monthlyAmount}
                  onAmountCommit={(n) =>
                    updateExpenseItem(activeCase.id, cat.id, it.id, { monthlyAmount: n })
                  }
                  onDelete={() => deleteExpenseItem(activeCase.id, cat.id, it.id)}
                />
              ))}
              <NewItemRow
                placeholder="Nuevo concepto de gasto"
                onAdd={(name, amount) => addExpenseItem(activeCase.id, cat.id, name, amount)}
              />
            </div>
            <p className="mt-3 text-right font-mono text-[12.5px] text-muted-foreground">
              Total: {formatCurrency(catTotal)} / mes · {formatCurrency(catTotal * 12)} / año
            </p>
          </Card>
        );
      })}

      <Card>
        <div className="flex items-center gap-2.5">
          <Input
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
          <Button
            variant="primary"
            onClick={() => {
              if (!newCategoryName.trim()) return;
              addCategory(activeCase.id, newCategoryName.trim());
              setNewCategoryName('');
            }}
          >
            Añadir categoría
          </Button>
        </div>
      </Card>

      <Card className="flex items-center justify-between text-sm font-bold">
        <span>Gasto total</span>
        <span className="font-mono">
          {formatCurrency(totals.monthlyExpense)} / mes ·{' '}
          {formatCurrency(totals.annualExpense)} / año
        </span>
      </Card>
    </div>
  );
}
