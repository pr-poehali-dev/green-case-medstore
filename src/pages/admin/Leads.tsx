import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { LEADS, LEAD_STATUS, LEAD_TYPE, Lead, fmtMoney } from '@/lib/adminData';

const MANAGERS = ['Не назначен', 'Смирнов А.', 'Козлова Н.', 'Петрова И.'];

function statusInfo(key: string) {
  return LEAD_STATUS.find((s) => s.key === key)!;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [selected, setSelected] = useState<Lead | null>(null);

  const setStatus = (id: number, status: Lead['status']) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  const setManager = (id: number, manager: string) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, manager } : l)));

  return (
    <AdminLayout title="Заявки">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">Все входящие лиды: КП, тендеры и консультации</p>
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
              {leads.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={l.manager}
                      onChange={(e) => setManager(l.id, e.target.value)}
                      className="rounded-lg border border-border bg-card px-2 py-1 text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                    >
                      {MANAGERS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value as Lead['status'])}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 outline-none cursor-pointer ${statusInfo(l.status).color}`}
                    >
                      {LEAD_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground font-mono-tech text-xs">{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-card h-full shadow-xl p-6 overflow-y-auto animate-slide-in-right">
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

            <div className="space-y-3 mb-6">
              {[
                { icon: 'User', label: 'Контакт', val: selected.contact },
                { icon: 'Phone', label: 'Телефон', val: selected.phone },
                { icon: 'Wallet', label: 'Сумма', val: fmtMoney(selected.amount) },
                { icon: 'Briefcase', label: 'Менеджер', val: selected.manager },
                { icon: 'Calendar', label: 'Дата', val: selected.date },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
                  <Icon name={row.icon} size={16} className="text-primary" />
                  <span className="text-xs text-muted-foreground w-20">{row.label}</span>
                  <span className="text-sm font-semibold">{row.val}</span>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-sm mb-3">История взаимодействий</h3>
            <div className="space-y-3 mb-6">
              {[
                { time: '23.06 14:20', text: 'Заявка создана через форму «Запросить КП»' },
                { time: '23.06 15:05', text: 'Назначен менеджер, отправлен запрос на уточнение ТЗ' },
                { time: '23.06 16:40', text: 'Клиент прислал техническое задание (PDF)' },
              ].map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1" />
                    {i < 2 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <div className="font-mono-tech text-[11px] text-muted-foreground">{h.time}</div>
                    <div className="text-sm">{h.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <Textarea placeholder="Добавить комментарий…" className="rounded-xl mb-3" rows={3} />
            <Button className="w-full rounded-xl font-semibold">
              <Icon name="Send" size={15} className="mr-2" /> Добавить комментарий
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
