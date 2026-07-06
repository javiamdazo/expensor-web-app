import { Link } from 'react-router-dom';
import { useAppStore, caseTotals } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { TrendChart, type TrendPoint } from '../components/TrendChart';
import { formatCurrency } from '../lib/format';
import { cardClass, buttonPrimaryClass } from '../lib/ui';

export function Dashboard() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const history = useAppStore((s) => s.history);
  const activeCase = cases.find((c) => c.id === activeCaseId);

  if (!activeCase) {
    return (
      <div className={cardClass}>
        <h1 className="text-lg font-semibold">Ningún caso seleccionado</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Crea tu primer caso para empezar a controlar tus gastos.
        </p>
        <Link to="/casos" className={`${buttonPrimaryClass} mt-4`}>
          Ir a Casos
        </Link>
      </div>
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{activeCase.name}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Resumen del presupuesto mensual y anual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Gasto mensual por categoría
        </h2>
        <CategoryBreakdownChart data={totals.categoryTotals} />
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Evolución histórica
        </h2>
        <TrendChart data={trendData} />
      </div>
    </div>
  );
}
