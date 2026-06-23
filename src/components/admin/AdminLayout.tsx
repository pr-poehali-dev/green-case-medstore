import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { ROLES, Role } from '@/lib/adminData';

const MENU = [
  { to: '/admin', label: 'Дашборд', icon: 'LayoutDashboard', roles: ['admin', 'manager', 'content', 'accountant'] },
  { to: '/admin/catalog', label: 'Каталог', icon: 'Package', roles: ['admin', 'content'] },
  { to: '/admin/leads', label: 'Заявки', icon: 'Inbox', roles: ['admin', 'manager'] },
  { to: '/admin/clients', label: 'Клиенты', icon: 'Building2', roles: ['admin', 'manager', 'accountant'] },
  { to: '/admin/content', label: 'Контент', icon: 'Newspaper', roles: ['admin', 'content'] },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<Role>('admin');
  const [roleOpen, setRoleOpen] = useState(false);
  const location = useLocation();

  const visibleMenu = MENU.filter((m) => m.roles.includes(role));

  return (
    <div className="min-h-screen bg-muted/40 flex">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0 h-screen`}
      >
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-green">
            <Icon name="BriefcaseMedical" size={20} />
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="font-display text-sm font-bold tracking-tight truncate">Зеленый чемодан</div>
              <div className="font-mono-tech text-[9px] text-muted-foreground">ADMIN PANEL</div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleMenu.map((m) => {
            const active = location.pathname === m.to;
            return (
              <NavLink
                key={m.to}
                to={m.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-secondary'
                }`}
                title={m.label}
              >
                <Icon name={m.icon} size={19} className="shrink-0" />
                {!collapsed && m.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary w-full transition-colors"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={19} className="shrink-0" />
            {!collapsed && 'Свернуть'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary transition-colors">
              <Icon name="Bell" size={19} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            {/* Role switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 hover:bg-secondary transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">А</div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-semibold">Алексей К.</div>
                  <div className="text-[11px] text-muted-foreground">{ROLES[role].label}</div>
                </div>
                <Icon name="ChevronDown" size={15} className="text-muted-foreground" />
              </button>
              {roleOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-card shadow-lg p-2 z-50 animate-fade-in">
                  <div className="px-2 py-1.5 text-[11px] font-mono-tech text-muted-foreground uppercase">Сменить роль (демо)</div>
                  {(Object.keys(ROLES) as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setRoleOpen(false); }}
                      className={`flex items-center gap-2.5 w-full rounded-lg px-2 py-2 text-sm transition-colors ${
                        role === r ? 'bg-secondary' : 'hover:bg-secondary'
                      }`}
                    >
                      <Icon name={ROLES[r].icon} size={16} className="text-primary" />
                      {ROLES[r].label}
                      {role === r && <Icon name="Check" size={15} className="ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
