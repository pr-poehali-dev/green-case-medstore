import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { contentApi, Article } from '@/lib/api';

const TYPE_COLOR: Record<string, string> = {
  'Новость': 'bg-blue-100 text-blue-700',
  'Статья': 'bg-purple-100 text-purple-700',
  'Документ': 'bg-amber-100 text-amber-700',
};

const PAGES = [
  { name: 'Главная страница', icon: 'Home' },
  { name: 'Блог / Новости', icon: 'Newspaper' },
  { name: 'Документы и лицензии', icon: 'FileCheck2' },
  { name: 'Контакты', icon: 'MapPin' },
];

const EMPTY: Partial<Article> = { title: '', type: 'Статья', status: 'Черновик', body: '' };

export default function Content() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Article>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    contentApi.list().then(setArticles).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (a: Article) => { setForm(a); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await contentApi.create(form);
      else await contentApi.update({ ...form, id: form.id! });
      setModal(null);
      load();
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Контент">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pages */}
        <div>
          <h3 className="font-bold text-lg mb-4">Страницы сайта</h3>
          <div className="space-y-3">
            {PAGES.map(p => (
              <button key={p.name} className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover-lift hover:border-primary/40 text-left transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon name={p.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{p.name}</div>
                </div>
                <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Новости и статьи</h3>
            <Button className="rounded-xl font-semibold" onClick={openAdd}>
              <Icon name="Plus" size={16} className="mr-2" /> Создать материал
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Заголовок</th>
                  <th className="px-4 py-3 font-medium">Тип</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(4)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>)}
                    </tr>
                  ))
                  : articles.map(a => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.author} · {new Date(a.created_at).toLocaleDateString('ru-RU')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_COLOR[a.type] || ''}`}>{a.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${a.status === 'Опубликовано' ? 'text-primary' : 'text-muted-foreground'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'Опубликовано' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(a)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
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
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">{modal === 'add' ? 'Новый материал' : 'Редактировать'}</h2>
              <button onClick={() => setModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Заголовок *</label>
                <Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl" placeholder="Заголовок материала" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Тип</label>
                  <select value={form.type || 'Статья'} onChange={e => setForm(f => ({ ...f, type: e.target.value as Article['type'] }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Статья</option><option>Новость</option><option>Документ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Статус</label>
                  <select value={form.status || 'Черновик'} onChange={e => setForm(f => ({ ...f, status: e.target.value as Article['status'] }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Черновик</option><option>Опубликовано</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Содержание</label>
                <Textarea value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="rounded-xl" rows={6} placeholder="Текст материала…" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setModal(null)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleSave} disabled={saving || !form.title} className="flex-1 rounded-xl font-semibold">
                {saving && <Icon name="Loader2" size={16} className="animate-spin mr-2" />}
                {modal === 'add' ? 'Создать' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
