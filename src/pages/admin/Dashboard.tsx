import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LEADS, LEAD_STATUS, LEAD_TYPE, fmtMoney } from '@/lib/adminData';

const STATS = [
  { label: 'Новых заявок', value: '24', delta: '+12%', up: true, icon: 'Inbox', color: 'text-primary bg-primary/10' },
  { label: 'Конверсия', value: '34%', delta: '+4%', up: true, icon: 'TrendingUp', color: 'text-blue-600 bg-blue-100' },
  { label: 'Средний чек', value: '2.8 млн ₽', delta: '-3%', up: false, icon: 'Wallet', color: 'text-purple-600 bg-purple-100' },
  { label: 'Сумма в работе', value: '32.4 млн ₽', delta: '+18%', up: true, icon: 'CircleDollarSign', color: 'text-amber-600 bg-amber-100' },
];

export default function Dashboard() {
  const funnel = LEAD_STATUS.map((s) => ({
    ...s,
    count: LEADS.filter((l) => l.status === s.key).length + Math.floor(Math.random() * 0),
  }));
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <AdminLayout title="Дашборд">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Сводка по заявкам и продажам за июнь 2026</p>
        <Button variant="outline" className="rounded-xl">
          <Icon name="Download" size={16} className="mr-2" /> Экспорт в Excel
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                <Icon name={s.icon} size={22} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-primary' : 'text-rose-600'}`}>
                <Icon name={s.up ? 'ArrowUp' : 'ArrowDown'} size={13} /> {s.delta}
              </span>
            </div>
            <div className="mt-4 font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold text-lg mb-5">Воронка по статусам</h3>
          <div className="space-y-3">
            {funnel.map((f) => (
              <div key={f.key} className="flex items-center gap-3">
                <span className="w-32 text-sm text-muted-foreground shrink-0">{f.label}</span>
                <div className="flex-1 h-8 rounded-lg bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-primary flex items-center justify-end px-2 text-xs font-semibold text-primary-foreground transition-all"
                    style={{ width: `${Math.max((f.count / maxFunnel) * 100, 8)}%` }}
                  >
                    {f.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest leads */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold text-lg mb-5">Последние заявки</h3>
          <div className="space-y-4">
            {LEADS.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${LEAD_TYPE[l.type].color}`}>
                  <Icon name={LEAD_TYPE[l.type].icon} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{l.org}</div>
                  <div className="text-xs text-muted-foreground">#{l.id} · {fmtMoney(l.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
