import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { ADMIN_PRODUCTS, PRODUCT_STATUS, ProductStatus } from '@/lib/adminData';

export default function Catalog() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');

  const products = ADMIN_PRODUCTS.filter(
    (p) =>
      (filter === 'all' || p.status === filter) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.ru.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AdminLayout title="Каталог товаров">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-border bg-card px-3">
          <Icon name="Search" size={18} className="text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или РУ…"
            className="border-0 shadow-none focus-visible:ring-0 px-0"
          />
        </div>
        <Button variant="outline" className="rounded-xl">
          <Icon name="Upload" size={16} className="mr-2" /> Импорт CSV/Excel
        </Button>
        <Button className="rounded-xl font-semibold">
          <Icon name="Plus" size={16} className="mr-2" /> Добавить товар
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70 hover:bg-accent'
          }`}
        >
          Все ({ADMIN_PRODUCTS.length})
        </button>
        {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70 hover:bg-accent'
            }`}
          >
            {PRODUCT_STATUS[s].label} ({ADMIN_PRODUCTS.filter((p) => p.status === s).length})
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
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono-tech text-xs font-semibold">{p.ru}</div>
                    <div className="font-mono-tech text-[11px] text-muted-foreground">до {p.ruValid}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS[p.status].color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS[p.status].dot}`} />
                      {PRODUCT_STATUS[p.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Icon name="Paperclip" size={14} /> {p.files} PDF
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Файлы">
                        <Icon name="FileUp" size={16} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Редактировать">
                        <Icon name="Pencil" size={16} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-colors" title="Удалить">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="PackageOpen" size={36} className="mx-auto mb-2 opacity-50" />
            Товары не найдены
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
