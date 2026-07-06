import { Link } from 'react-router-dom';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { TrendChart, type TrendPoint } from '../components/TrendChart';
import { formatCurrency } from '../lib/format';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function Dashboard() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const history = useAppStore((s) => s.history);
  const activeCase = cases.find((c) => c.id === activeCaseId);

  if (!activeCase) {
    return (
      <Card>
        <h1 className="text-lg font-bold">Ningún caso seleccionado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea tu primer caso para empezar a controlar tus gastos.
        </p>
        <Button asChild className="mt-4">
          <Link to="/casos">Ir a Casos</Link>
        </Button>
      </Card>
    );
  }

  const totals = caseTotals(activeCase);

  const trendData: TrendPoint[] = history
    .filter((h) => h.caseId === activeCase.id)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((h) => {
      const ingresos = h.lines
        .filter((l) => l.section === 'ingreso')
        .reduce((sum, l) => sum + l.amount, 0);
      const gastos = h.lines
        .filter((l) => l.section === 'gasto')
        .reduce((sum, l) => sum + l.amount, 0);
      return { month: h.month, ingresos, gastos, ahorro: ingresos - gastos };
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold">{activeCase.name}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Resumen del presupuesto mensual y anual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <StatCard
          label="Ingresos mensuales"
          value={formatCurrency(totals.monthlyIncome)}
          sub={`${formatCurrency(totals.annualIncome)} / año`}
          tone="good"
        />
        <StatCard
          label="Gastos mensuales"
          value={formatCurrency(totals.monthlyExpense)}
          sub={`${formatCurrency(totals.annualExpense)} / año`}
          tone="critical"
        />
        <StatCard
          label="Ahorro mensual"
          value={formatCurrency(totals.monthlySavings)}
          sub={`${formatCurrency(totals.annualSavings)} / año`}
          tone={totals.monthlySavings >= 0 ? 'good' : 'critical'}
        />
      </div>

      <Card>
        <CardTitle className="mb-4">Gasto mensual por categoría</CardTitle>
        <CategoryBreakdownChart data={totals.categoryTotals} />
      </Card>

      <Card>
        <CardTitle className="mb-2">Evolución histórica</CardTitle>
        <TrendChart data={trendData} />
      </Card>
    </div>
  );
}
