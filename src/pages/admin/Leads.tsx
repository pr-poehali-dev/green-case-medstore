import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { leadsApi, Lead, LeadHistoryItem } from '@/lib/api';
import { LEAD_STATUS, LEAD_TYPE, fmtMoney } from '@/lib/adminData';

const MANAGERS = ['', 'Смирнов А.', 'Козлова Н.', 'Петрова И.'];

function statusInfo(key: string) {
  return LEAD_STATUS.find(s => s.key === key) || LEAD_STATUS[0];
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    leadsApi.list().then(setLeads).finally(() => setLoading(false));
  }, []);

  const openLead = async (l: Lead) => {
    setSelected(l);
    setHistory([]);
    setComment('');
    const h = await leadsApi.getHistory(l.id).catch(() => []);
    setHistory(h);
  };

  const updateStatus = async (id: number, status: Lead['status']) => {
    await leadsApi.update({ id, status });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
  };

  const updateManager = async (id: number, manager: string) => {
    await leadsApi.update({ id, manager });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, manager } : l));
  };

  const addComment = async () => {
    if (!selected || !comment.trim()) return;
    setPosting(true);
    await leadsApi.addHistory(selected.id, comment.trim());
    const h = await leadsApi.getHistory(selected.id).catch(() => []);
    setHistory(h);
    setComment('');
    setPosting(false);
  };

  return (
    <AdminLayout title="Заявки">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">Все входящие лиды: КП, тендеры, консультации</p>
        <Button variant="outline" className="rounded-xl">
          <Icon name="Download" size={16} className="mr-2" /> Экспорт
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">№ / Тип</th>
                <th className="px-4 py-3 font-medium">Организация</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Менеджер</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium text-right">Дата</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(7)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>)}
                  </tr>
                ))
                : leads.map(l => (
                  <tr key={l.id} onClick={() => openLead(l)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="font-mono-tech text-xs font-semibold">#{l.id}</div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold mt-1 ${LEAD_TYPE[l.type].color}`}>
                        <Icon name={LEAD_TYPE[l.type].icon} size={11} /> {LEAD_TYPE[l.type].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{l.org}</div>
                      <div className="text-xs text-muted-foreground">{l.contact}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{fmtMoney(l.amount)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select value={l.manager} onChange={e => updateManager(l.id, e.target.value)}
                        className="rounded-lg border border-border bg-card px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/30">
                        {MANAGERS.map(m => <option key={m} value={m}>{m || 'Не назначен'}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select value={l.status} onChange={e => updateStatus(l.id, e.target.value as Lead['status'])}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 outline-none cursor-pointer ${statusInfo(l.status).color}`}>
                        {LEAD_STATUS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-tech text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-card h-full shadow-xl p-6 overflow-y-auto animate-slide-in-right border-l border-border">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="font-mono-tech text-xs text-muted-foreground">Заявка #{selected.id}</div>
                <h2 className="font-display text-xl font-bold mt-1">{selected.org}</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mt-2 ${LEAD_TYPE[selected.type].color}`}>
                  <Icon name={LEAD_TYPE[selected.type].icon} size={12} /> {LEAD_TYPE[selected.type].label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {[
                { icon: 'User', label: 'Контакт', val: selected.contact },
                { icon: 'Phone', label: 'Телефон', val: selected.phone },
                { icon: 'Mail', label: 'Email', val: selected.email || '—' },
                { icon: 'Hash', label: 'ИНН', val: selected.inn || '—' },
                { icon: 'Wallet', label: 'Сумма', val: fmtMoney(selected.amount) },
                { icon: 'Briefcase', label: 'Менеджер', val: selected.manager || 'Не назначен' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
                  <Icon name={row.icon} size={15} className="text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{row.label}</span>
                  <span className="text-sm font-semibold truncate">{row.val}</span>
                </div>
              ))}
            </div>

            {selected.product && (
              <div className="mb-4 rounded-xl bg-primary/8 border border-primary/20 px-3 py-2.5">
                <div className="text-xs text-muted-foreground mb-1">Позиция / товар</div>
                <div className="text-sm font-semibold">{selected.product}</div>
              </div>
            )}

            {selected.comment && (
              <div className="mb-6 rounded-xl bg-secondary px-3 py-2.5">
                <div className="text-xs text-muted-foreground mb-1">Комментарий клиента</div>
                <div className="text-sm whitespace-pre-wrap">{selected.comment}</div>
              </div>
            )}

            {/* Status */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Статус заявки</label>
              <div className="flex flex-wrap gap-2">
                {LEAD_STATUS.map(s => (
                  <button key={s.key} onClick={() => updateStatus(selected.id, s.key as Lead['status'])}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${selected.status === s.key ? 'bg-primary text-primary-foreground' : `${s.color} hover:opacity-80`}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <h3 className="font-bold text-sm mb-3">История взаимодействий</h3>
            <div className="space-y-3 mb-5">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Комментариев пока нет</p>
              ) : history.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0" />
                    {i < history.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-[11px] text-muted-foreground">
                        {new Date(h.created_at).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </span>
                      <span className="text-[11px] font-semibold text-primary">{h.author}</span>
                    </div>
                    <div className="text-sm mt-0.5">{h.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <Textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Добавить комментарий…" className="rounded-xl mb-3" rows={3} />
            <Button onClick={addComment} disabled={posting || !comment.trim()} className="w-full rounded-xl font-semibold">
              {posting ? <Icon name="Loader2" size={15} className="animate-spin mr-2" /> : <Icon name="Send" size={15} className="mr-2" />}
              Добавить комментарий
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}