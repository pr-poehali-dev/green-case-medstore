import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ARTICLES } from '@/lib/adminData';

const PAGES = [
  { name: 'Главная страница', icon: 'Home', updated: '20.06.2026' },
  { name: 'Блог / Новости', icon: 'Newspaper', updated: '18.06.2026' },
  { name: 'Документы и лицензии', icon: 'FileCheck2', updated: '15.06.2026' },
  { name: 'Контакты', icon: 'MapPin', updated: '10.06.2026' },
];

const typeColor: Record<string, string> = {
  'Новость': 'bg-blue-100 text-blue-700',
  'Статья': 'bg-purple-100 text-purple-700',
  'Документ': 'bg-amber-100 text-amber-700',
};

export default function Content() {
  return (
    <AdminLayout title="Контент">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pages */}
        <div>
          <h3 className="font-bold text-lg mb-4">Страницы сайта</h3>
          <div className="space-y-3">
            {PAGES.map((p) => (
              <button key={p.name} className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover-lift hover:border-primary/40 text-left transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={p.icon} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="font-mono-tech text-[11px] text-muted-foreground">изменено {p.updated}</div>
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
            <Button className="rounded-xl font-semibold">
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
                {ARTICLES.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.author} · {a.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor[a.type]}`}>{a.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${a.status === 'Опубликовано' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.status === 'Опубликовано' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                          <Icon name="Pencil" size={16} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-colors">
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
