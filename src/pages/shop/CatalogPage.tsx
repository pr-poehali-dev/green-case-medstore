import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import KpModal from '@/components/shop/KpModal';
import ProductCard from '@/components/shop/ProductCard';
import { productsApi, Product } from '@/lib/api';
import { CATEGORIES } from '@/data/shop';

const STATUSES = [
  { val: '', label: 'Любой статус' },
  { val: 'in_stock', label: 'В наличии' },
  { val: 'order', label: 'Под заказ' },
];

const CAT_MAP: Record<string, string> = {
  video: 'Видеосистемы',
  gyn:   'Гинекология',
  cosm:  'Косметология',
  ent:   'Отоларингология',
  xray:  'Рентген аппараты',
  elec:  'Электрохирургия',
};
// обратный маппинг: русское название → id категории
const CAT_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(CAT_MAP).map(([k, v]) => [v, k])
);

export default function CatalogPage() {
  const [urlParams, setUrlParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpOpen, setKpOpen] = useState(false);
  const [kpProduct, setKpProduct] = useState<string | undefined>();
  const [compare, setCompare] = useState<number[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const q      = urlParams.get('q') || '';
  const cat    = urlParams.get('cat') || '';       // id-формат (video, gyn…)
  const brand  = urlParams.get('brand') || '';
  const status = urlParams.get('status') || '';
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => { setSearchInput(q); }, [q]);

  // Грузим с API, фильтрацию делаем на клиенте после загрузки
  const load = () => {
    setLoading(true);
    productsApi.list().then(data => {
      // исключаем снятые с производства
      const active = data.filter(p => p.status !== 'discontinued');
      setProducts(active);
      setBrands([...new Set(active.map(p => p.brand).filter(Boolean))]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);  

  const setFilter = (key: string, val: string) => {
    const next = new URLSearchParams(urlParams);
    if (val) next.set(key, val); else next.delete(key);
    setUrlParams(next);
  };

  const resetFilters = () => setUrlParams(new URLSearchParams());

  const activeFilters = [q, cat, brand, status].filter(Boolean).length;

  // Клиентская фильтрация — категория сравнивается через CAT_MAP
  const filtered = products.filter(p => {
    const catName = cat ? (CAT_MAP[cat] || cat) : '';
    return (
      (!q || p.name.toLowerCase().includes(q.toLowerCase()) ||
             p.ru_number?.toLowerCase().includes(q.toLowerCase()) ||
             p.brand?.toLowerCase().includes(q.toLowerCase())) &&
      (!catName || p.category === catName) &&
      (!brand || p.brand === brand) &&
      (!status || p.status === status)
    );
  });

  const toggleCompare = (id: number) =>
    setCompare(p => p.includes(id) ? p.filter(n => n !== id) : p.length < 4 ? [...p, id] : p);

  const handleSearch = (val: string) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setFilter('q', val), 400);
  };

  return (
    <ShopLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Каталог</span>
          {cat && CAT_MAP[cat] && (
            <><Icon name="ChevronRight" size={14} />
            <span className="text-foreground font-medium">{CAT_MAP[cat]}</span></>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="rounded-2xl border border-border bg-card p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Фильтры</h3>
                {activeFilters > 0 && (
                  <button onClick={resetFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Icon name="X" size={13} /> Сбросить ({activeFilters})
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Поиск по названию / РУ</label>
                <div className="flex gap-2">
                  <Input value={searchInput} onChange={e => handleSearch(e.target.value)}
                    placeholder="Название или РУ…" className="rounded-xl text-sm h-9 flex-1" />
                  <Button size="sm" className="rounded-xl h-9 px-3" onClick={() => setFilter('q', searchInput)}>
                    <Icon name="Search" size={15} />
                  </Button>
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Направление</label>
                <div className="space-y-1">
                  <button onClick={() => setFilter('cat', '')}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${!cat ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                    Все направления
                  </button>
                  {CATEGORIES.map(c => {
                    const catCount = products.filter(p => p.category === c.name).length;
                    return (
                      <button key={c.id} onClick={() => setFilter('cat', c.id)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors flex items-center justify-between ${cat === c.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                        <span>{c.name}</span>
                        <span className={`font-mono-tech text-xs ${cat === c.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{catCount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand */}
              {brands.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Производитель</label>
                  <select value={brand} onChange={e => setFilter('brand', e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Все производители</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Наличие</label>
                <div className="space-y-1">
                  {STATUSES.map(s => (
                    <button key={s.val} onClick={() => setFilter('status', s.val)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${status === s.val ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Загрузка…' : (
                  <>{q && <><span className="font-medium text-foreground">«{q}»</span> — </>}найдено <span className="font-semibold text-foreground">{filtered.length}</span> позиций</>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="h-44 bg-muted animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground rounded-2xl border border-border bg-card">
                <Icon name="PackageOpen" size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg text-foreground">Ничего не найдено</p>
                <p className="text-sm mt-1">Попробуйте изменить параметры фильтров</p>
                <Button variant="outline" className="mt-4 rounded-xl" onClick={resetFilters}>Сбросить фильтры</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    inCompare={compare.includes(p.id)}
                    onCompare={() => toggleCompare(p.id)}
                    onKp={() => { setKpProduct(p.name); setKpOpen(true); }}
                    animationDelay={i * 0.04}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-5 py-3 flex items-center gap-4 glow-green animate-float-up shadow-xl">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Icon name="GitCompare" size={16} className="text-primary" /> Сравнение: {compare.length}/4
          </span>
          <Button size="sm" className="rounded-xl font-semibold h-8">Сравнить</Button>
          <button onClick={() => setCompare([])} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>
      )}

      <KpModal open={kpOpen} onClose={() => { setKpOpen(false); setKpProduct(undefined); }} productName={kpProduct} />
    </ShopLayout>
  );
}