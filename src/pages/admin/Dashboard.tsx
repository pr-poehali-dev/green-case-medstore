import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { leadsApi, Lead } from '@/lib/api';
import { LEAD_STATUS, LEAD_TYPE, fmtMoney } from '@/lib/adminData';

const STAT_DEFS = [
  { key: 'total', label: 'Всего заявок', icon: 'Inbox', color: 'text-primary bg-primary/10' },
  { key: 'new', label: 'Новых', icon: 'Sparkles', color: 'text-blue-600 bg-blue-100' },
  { key: 'amount', label: 'Сумма в работе', icon: 'CircleDollarSign', color: 'text-amber-600 bg-amber-100' },
  { key: 'closed', label: 'Закрыто сделок', icon: 'CheckCircle2', color: 'text-purple-600 bg-purple-100' },
];

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.list().then(setLeads).finally(() => setLoading(false));
  }, []);

  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const amount = leads.filter(l => l.status !== 'closed').reduce((s, l) => s + l.amount, 0);
  const closed = leads.filter(l => l.status === 'closed').length;
  const statValues: Record<string, string | number> = { total, new: newCount, amount: fmtMoney(amount), closed };

  const funnel = LEAD_STATUS.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.key).length,
  }));
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1);

  return (
    <AdminLayout title="Дашборд">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Сводка по всем входящим заявкам</p>
        <Button variant="outline" className="rounded-xl">
          <Icon name="Download" size={16} className="mr-2" /> Экспорт в Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_DEFS.map((s, i) => (
          <div key={s.key} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
              <Icon name={s.icon} size={22} />
            </div>
            <div className="mt-4 font-display text-2xl font-bold">
              {loading ? <div className="h-7 w-20 rounded bg-muted animate-pulse" /> : statValues[s.key]}
            </div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold text-lg mb-5">Воронка по статусам</h3>
          <div className="space-y-3">
            {loading
              ? [...Array(7)].map((_, i) => <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />)
              : funnel.map(f => (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-muted-foreground shrink-0">{f.label}</span>
                  <div className="flex-1 h-8 rounded-lg bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-primary flex items-center justify-end px-2 text-xs font-semibold text-primary-foreground transition-all duration-700"
                      style={{ width: `${Math.max((f.count / maxFunnel) * 100, f.count > 0 ? 6 : 0)}%` }}
                    >
                      {f.count > 0 && f.count}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Latest leads */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-bold text-lg mb-5">Последние заявки</h3>
          <div className="space-y-4">
            {loading
              ? [...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)
              : leads.slice(0, 6).map(l => (
                <div key={l.id} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${LEAD_TYPE[l.type].color}`}>
                    <Icon name={LEAD_TYPE[l.type].icon} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{l.org}</div>
                    <div className="text-xs text-muted-foreground">#{l.id} · {fmtMoney(l.amount)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
