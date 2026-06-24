import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { clientsApi, Client } from '@/lib/api';
import { fmtMoney } from '@/lib/adminData';
import DealsDrawer from '@/components/admin/DealsDrawer';

const EMPTY: Partial<Client> = { name: '', inn: '', kpp: '', type: 'private', discount: 0 };

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Client>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [dealsClient, setDealsClient] = useState<Client | null>(null);

  const load = () => {
    setLoading(true);
    clientsApi.list({ q: query || undefined }).then(setClients).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (c: Client) => { setForm(c); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await clientsApi.create(form);
      else await clientsApi.update({ ...form, id: form.id! });
      setModal(null);
      load();
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Клиенты">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-border bg-card px-3">
          <Icon name="Search" size={18} className="text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Поиск по названию или ИНН… (Enter)" className="border-0 shadow-none focus-visible:ring-0 px-0" />
        </div>
        <Button className="rounded-xl font-semibold" onClick={openAdd}>
          <Icon name="Plus" size={16} className="mr-2" /> Добавить организацию
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl border border-border bg-card p-5 h-48 animate-pulse bg-muted/30" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={c.type === 'state' ? 'Landmark' : 'Building2'} size={22} />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.type === 'state' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}`}>
                  {c.type === 'state' ? 'Государственная' : 'Частная'}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-base leading-snug">{c.name}</h3>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 font-mono-tech text-xs text-muted-foreground">
                {c.inn && <span>ИНН {c.inn}</span>}
                {c.kpp && <span>КПП {c.kpp}</span>}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-secondary py-2">
                  <div className="font-display text-lg font-bold">{c.deals_count}</div>
                  <div className="text-[10px] text-muted-foreground">сделок</div>
                </div>
                <div className="rounded-xl bg-secondary py-2">
                  <div className="font-display text-sm font-bold leading-tight pt-1">
                    {c.total_amount >= 1_000_000 ? `${(c.total_amount / 1_000_000).toFixed(1)}М` : fmtMoney(c.total_amount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">оборот</div>
                </div>
                <div className="rounded-xl bg-primary/10 py-2">
                  <div className="font-display text-lg font-bold text-primary">{c.discount}%</div>
                  <div className="text-[10px] text-muted-foreground">скидка</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs" onClick={() => openEdit(c)}>
                  <Icon name="Pencil" size={14} className="mr-1.5" /> Редактировать
                </Button>
                <Button variant="outline" className="rounded-xl h-9 w-9 p-0" title="История сделок" onClick={() => setDealsClient(c)}>
                  <Icon name="History" size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dealsClient && (
        <DealsDrawer client={dealsClient} onClose={() => setDealsClient(null)} />
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">{modal === 'add' ? 'Новая организация' : 'Редактировать'}</h2>
              <button onClick={() => setModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Название *</label>
                <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" placeholder="ГКБ №1 им. Пирогова" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">ИНН</label>
                  <Input value={form.inn || ''} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} className="rounded-xl" placeholder="7701234567" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">КПП</label>
                  <Input value={form.kpp || ''} onChange={e => setForm(f => ({ ...f, kpp: e.target.value }))} className="rounded-xl" placeholder="770101001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Тип</label>
                  <select value={form.type || 'private'} onChange={e => setForm(f => ({ ...f, type: e.target.value as Client['type'] }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="private">Частная</option>
                    <option value="state">Государственная</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Скидка (%)</label>
                  <Input type="number" min={0} max={100} value={form.discount ?? 0} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} className="rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setModal(null)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1 rounded-xl font-semibold">
                {saving && <Icon name="Loader2" size={16} className="animate-spin mr-2" />}
                {modal === 'add' ? 'Добавить' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}