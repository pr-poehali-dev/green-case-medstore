import { useState } from 'react';
import { NavLink, useLocation, Navigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { ROLES } from '@/lib/adminData';
import { useAuth } from '@/contexts/AuthContext';

const MENU = [
  { to: '/admin', label: 'Дашборд', icon: 'LayoutDashboard', roles: ['admin', 'manager', 'content', 'accountant'] },
  { to: '/admin/catalog', label: 'Каталог', icon: 'Package', roles: ['admin', 'content'] },
  { to: '/admin/leads', label: 'Заявки', icon: 'Inbox', roles: ['admin', 'manager'] },
  { to: '/admin/clients', label: 'Клиенты', icon: 'Building2', roles: ['admin', 'manager', 'accountant'] },
  { to: '/admin/content', label: 'Контент', icon: 'Newspaper', roles: ['admin', 'content'] },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-green">
            <Icon name="BriefcaseMedical" size={28} />
          </div>
          <Icon name="Loader2" size={20} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const role = user.role;
  const visibleMenu = MENU.filter((m) => m.roles.includes(role));
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/40 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0 h-screen z-40`}>
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

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleMenu.map((m) => {
            const active = location.pathname === m.to;
            return (
              <NavLink
                key={m.to}
                to={m.to}
                title={m.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-secondary'
                }`}
              >
                <Icon name={m.icon} size={19} className="shrink-0" />
                {!collapsed && m.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <NavLink
            to="/"
            title="На сайт"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Icon name="ExternalLink" size={19} className="shrink-0" />
            {!collapsed && 'На сайт'}
          </NavLink>
          <button
            onClick={() => setCollapsed(c => !c)}
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

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 hover:bg-secondary transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{ROLES[role]?.label}</div>
                </div>
                <Icon name="ChevronDown" size={15} className="text-muted-foreground" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-lg p-2 z-50 animate-float-up">
                  <div className="px-2 py-1.5 text-[11px] font-mono-tech text-muted-foreground uppercase">{user.email}</div>
                  <div className={`mx-2 mb-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${ROLES[role]?.color}`}>
                    {ROLES[role]?.label}
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Icon name="LogOut" size={16} /> Выйти из системы
                  </button>
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
