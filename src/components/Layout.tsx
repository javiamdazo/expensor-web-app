import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { inputClass } from '../lib/ui';

const navItems = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/presupuesto', label: 'Presupuesto' },
  { to: '/historico', label: 'Histórico' },
  { to: '/casos', label: 'Casos' },
  { to: '/datos', label: 'Datos' },
];

export function Layout() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">
            💶 Expensor
          </span>

          <select
            className={`${inputClass} ml-0 w-auto min-w-40 sm:ml-4`}
            value={activeCaseId ?? ''}
            onChange={(e) => setActiveCase(e.target.value)}
          >
            {cases.length === 0 && <option value="">Sin casos</option>}
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <nav className="ml-auto flex flex-wrap gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
