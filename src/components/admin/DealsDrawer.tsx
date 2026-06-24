import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { dealsApi, Deal, Client } from '@/lib/api';
import DealModal from './DealModal';

interface Props {
  client: Client;
  onClose: () => void;
}

const DEAL_STATUS: Record<Deal['status'], { label: string; color: string; icon: string }> = {
  active:    { label: 'Активна',   color: 'bg-blue-100 text-blue-700',     icon: 'TrendingUp' },
  completed: { label: 'Завершена', color: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle2' },
  cancelled: { label: 'Отменена',  color: 'bg-rose-100 text-rose-700',     icon: 'XCircle' },
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DealsDrawer({ client, onClose }: Props) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', stages: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dealsApi.list(client.id).then(setDeals).finally(() => setLoading(false));
  }, [client.id]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const stages = form.stages.split('\n').map(s => s.trim()).filter(Boolean);
    await dealsApi.create({ client_id: client.id, title: form.title.trim(), description: form.description.trim(), stages });
    const updated = await dealsApi.list(client.id);
    setDeals(updated);
    setForm({ title: '', description: '', stages: '' });
    setShowAdd(false);
    setSaving(false);
  };

  const handleDealUpdated = (updated: Deal) => {
    setDeals(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
  };

  const activeDeals = deals.filter(d => d.status === 'active');
  const otherDeals = deals.filter(d => d.status !== 'active');

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
        <div className="relative w-full max-w-md bg-card h-full shadow-xl border-l border-border flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">История сделок</div>
              <h2 className="font-display text-lg font-bold">{client.name}</h2>
              {client.inn && <div className="text-xs text-muted-foreground mt-0.5">ИНН {client.inn}</div>}
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-border shrink-0">
            <div className="text-center">
              <div className="font-display text-xl font-bold">{deals.length}</div>
              <div className="text-[11px] text-muted-foreground">всего сделок</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold text-blue-600">{activeDeals.length}</div>
              <div className="text-[11px] text-muted-foreground">активных</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold text-emerald-600">{deals.filter(d => d.status === 'completed').length}</div>
              <div className="text-[11px] text-muted-foreground">завершено</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Add deal */}
            <Button className="w-full rounded-xl font-semibold" onClick={() => setShowAdd(s => !s)}>
              <Icon name="Plus" size={16} className="mr-2" />
              {showAdd ? 'Отмена' : 'Добавить сделку'}
            </Button>

            {showAdd && (
              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3 animate-float-up">
                <h3 className="font-bold text-sm">Новая сделка</h3>
                <Input
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Название сделки *"
                  className="rounded-lg"
                />
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Описание (необязательно)"
                  className="rounded-lg"
                  rows={2}
                />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Начальные этапы <span className="font-normal">(каждый с новой строки)</span>
                  </label>
                  <Textarea
                    value={form.stages}
                    onChange={e => setForm(f => ({ ...f, stages: e.target.value }))}
                    placeholder={"Переговоры\nПодготовка КП\nПодписание договора"}
                    className="rounded-lg font-mono text-xs"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setShowAdd(false)}>Отмена</Button>
                  <Button className="flex-1 rounded-lg font-semibold" disabled={saving || !form.title.trim()} onClick={handleCreate}>
                    {saving ? <Icon name="Loader2" size={15} className="animate-spin mr-1.5" /> : null}
                    Создать
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />)}
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Briefcase" size={36} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">Сделок пока нет</p>
                <p className="text-xs mt-1">Нажмите «Добавить сделку» чтобы начать</p>
              </div>
            ) : (
              <>
                {activeDeals.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Активные</div>
                    {activeDeals.map(d => <DealCard key={d.id} deal={d} onClick={() => setSelectedDeal(d)} />)}
                  </div>
                )}
                {otherDeals.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">Завершённые / отменённые</div>
                    {otherDeals.map(d => <DealCard key={d.id} deal={d} onClick={() => setSelectedDeal(d)} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdated={handleDealUpdated}
        />
      )}
    </>
  );
}

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const cfg = DEAL_STATUS[deal.status];
  const progress = deal.stages_total > 0 ? Math.round((deal.stages_done / deal.stages_total) * 100) : null;

  return (
    <div onClick={onClick}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">{deal.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          {deal.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{deal.description}</p>}
        </div>
        <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span>{fmtDate(deal.created_at)}</span>
        {deal.created_by_name && <span>· {deal.created_by_name}</span>}
        {deal.stages_total > 0 && (
          <span className="ml-auto font-medium">{deal.stages_done}/{deal.stages_total} этапов</span>
        )}
      </div>

      {progress !== null && (
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
