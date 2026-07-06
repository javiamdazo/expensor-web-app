import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../lib/theme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '../lib/utils';
import {
  ResumenIcon,
  PresupuestoIcon,
  HistoricoIcon,
  CasosIcon,
  DatosIcon,
} from './icons';

const navItems = [
  { to: '/', label: 'Resumen', end: true, Icon: ResumenIcon },
  { to: '/presupuesto', label: 'Presupuesto', end: false, Icon: PresupuestoIcon },
  { to: '/historico', label: 'Histórico', end: false, Icon: HistoricoIcon },
  { to: '/casos', label: 'Casos', end: false, Icon: CasosIcon },
  { to: '/datos', label: 'Datos', end: false, Icon: DatosIcon },
];

export function Layout() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const setActiveCase = useAppStore((s) => s.setActiveCase);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background text-sm text-foreground">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-5">
        <div className="flex items-center gap-2.5 px-5 pb-5">
          <div className="flex size-[30px] items-center justify-center rounded-sm bg-primary text-[15px] font-extrabold text-primary-foreground">
            €
          </div>
          <div className="text-base font-extrabold tracking-tight">Expensor</div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-sidebar-border px-5 pt-4">
          <span className="text-xs font-semibold text-muted-foreground">Tema</span>
          <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
          <Select value={activeCaseId ?? ''} onValueChange={setActiveCase}>
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Sin casos" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Avatar>
            <AvatarFallback>JG</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
