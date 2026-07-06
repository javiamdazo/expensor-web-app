import { useState } from 'react';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { formatCurrency } from '../lib/format';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

export function Cases() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const addCase = useAppStore((s) => s.addCase);
  const renameCase = useAppStore((s) => s.renameCase);
  const deleteCase = useAppStore((s) => s.deleteCase);
  const setActiveCase = useAppStore((s) => s.setActiveCase);

  const [newCaseName, setNewCaseName] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold">Casos</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Cada caso es un presupuesto independiente. Duplica uno para comparar escenarios sin
          perder el original.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {cases.map((c) => {
          const totals = caseTotals(c);
          const isActive = c.id === activeCaseId;
          return (
            <div
              key={c.id}
              className={cn(
                'flex flex-wrap items-center gap-3.5 rounded-[10px] border bg-card px-[18px] py-3.5',
                isActive ? 'border-foreground' : 'border-border',
              )}
            >
              <Input
                className="max-w-[220px] font-semibold"
                value={c.name}
                onChange={(e) => renameCase(c.id, e.target.value)}
              />
              <span className="flex-1 font-mono text-[12.5px] text-muted-foreground">
                Ahorro: {formatCurrency(totals.monthlySavings)} / mes
              </span>
              {isActive && <Badge>Activo</Badge>}
              <div className="ml-auto flex gap-2">
                {!isActive && (
                  <Button variant="secondary" onClick={() => setActiveCase(c.id)}>
                    Activar
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    const name = prompt('Nombre del nuevo caso duplicado:', `${c.name} (copia)`);
                    if (name?.trim()) addCase(name.trim(), c.id);
                  }}
                >
                  Duplicar
                </Button>
                <Button
                  variant="link"
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
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="flex items-center gap-2.5">
        <Input
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
        <Button
          variant="primary"
          onClick={() => {
            if (!newCaseName.trim()) return;
            addCase(newCaseName.trim());
            setNewCaseName('');
          }}
        >
          Crear caso vacío
        </Button>
      </Card>
    </div>
  );
}
