import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { productsApi, Product } from '@/lib/api';
import { PRODUCT_STATUS, ProductStatus } from '@/lib/adminData';

const CATEGORIES = ['Видеосистемы', 'Гинекология', 'Косметология', 'Отоларингология', 'Рентген аппараты', 'Электрохирургия'];
const EMPTY: Partial<Product> = { name: '', reg_name: '', category: '', brand: '', ru_number: '', ru_valid: '', status: 'in_stock', specs: [], description: '' };

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Product>>(EMPTY);
  const [specsStr, setSpecsStr] = useState('');
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = (q = query, st = filter) => {
    setLoading(true);
    productsApi.list({ q: q || undefined, status: st !== 'all' ? st : undefined })
      .then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSearch = (v: string) => {
    setQuery(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, filter), 400);
  };

  const handleFilter = (f: ProductStatus | 'all') => { setFilter(f); load(query, f); };

  const openAdd = () => { setForm(EMPTY); setSpecsStr(''); setModal('add'); };
  const openEdit = (p: Product) => { setForm(p); setSpecsStr((p.specs || []).join('\n')); setModal('edit'); };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    setSaving(true);
    const specs = specsStr.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      if (modal === 'add') {
        await productsApi.create({ ...form, specs });
      } else {
        await productsApi.update({ ...form, specs, id: form.id! });
      }
      closeModal();
      load();
    } finally { setSaving(false); }
  };

  const statusKeys = Object.keys(PRODUCT_STATUS) as ProductStatus[];

  return (
    <AdminLayout title="Каталог товаров">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-border bg-card px-3">
          <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
          <Input value={query} onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по названию или РУ…" className="border-0 shadow-none focus-visible:ring-0 px-0" />
        </div>
        <Button variant="outline" className="rounded-xl">
          <Icon name="Upload" size={16} className="mr-2" /> Импорт CSV
        </Button>
        <Button className="rounded-xl font-semibold" onClick={openAdd}>
          <Icon name="Plus" size={16} className="mr-2" /> Добавить товар
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...statusKeys] as const).map(s => (
          <button key={s} onClick={() => handleFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70 hover:bg-accent'}`}>
            {s === 'all' ? `Все (${products.length})` : `${PRODUCT_STATUS[s].label} (${products.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Номер РУ</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Файлы</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(6)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>)}
                  </tr>
                ))
                : products.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono-tech text-xs font-semibold">{p.ru_number}</div>
                      <div className="font-mono-tech text-[11px] text-muted-foreground">до {p.ru_valid}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS[p.status].color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS[p.status].dot}`} />
                        {PRODUCT_STATUS[p.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="Paperclip" size={14} /> {p.files_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Редактировать">
                          <Icon name="Pencil" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {!loading && products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="PackageOpen" size={36} className="mx-auto mb-2 opacity-50" />
            Товары не найдены
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto animate-float-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">{modal === 'add' ? 'Добавить товар' : 'Редактировать товар'}</h2>
              <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"><Icon name="X" size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Название *</label>
                <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" placeholder="Название товара" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Название по РУ</label>
                <Input value={form.reg_name || ''} onChange={e => setForm(f => ({ ...f, reg_name: e.target.value }))} className="rounded-xl" placeholder="По регистрационному удостоверению" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Категория</label>
                  <select value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                    <option value="">— выбрать —</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Производитель</label>
                  <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="rounded-xl" placeholder="Бренд" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Номер РУ</label>
                  <Input value={form.ru_number || ''} onChange={e => setForm(f => ({ ...f, ru_number: e.target.value }))} className="rounded-xl" placeholder="РЗН 2023/XXXXX" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Действует до</label>
                  <Input value={form.ru_valid || ''} onChange={e => setForm(f => ({ ...f, ru_valid: e.target.value }))} className="rounded-xl" placeholder="мм.гггг" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Статус наличия</label>
                <select value={form.status || 'in_stock'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                  {statusKeys.map(s => <option key={s} value={s}>{PRODUCT_STATUS[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Характеристики (каждая с новой строки)</label>
                <Textarea value={specsStr} onChange={e => setSpecsStr(e.target.value)} className="rounded-xl" rows={4} placeholder={"4K UHD сенсор\nNBI-режим\nГлубина 1.5–100 мм"} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Описание</label>
                <Textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl" rows={3} placeholder="Описание товара" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1 rounded-xl font-semibold">
                {saving ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : null}
                {modal === 'add' ? 'Добавить' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
