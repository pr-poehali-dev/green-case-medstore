import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import KpModal from '@/components/shop/KpModal';
import { CATEGORIES, ADVANTAGES, HERO_IMG } from '@/data/shop';
import { productsApi, Product } from '@/lib/api';

export default function Index() {
  const navigate = useNavigate();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list().then(all => {
      setApiProducts(all.filter(p => p.status !== 'discontinued').slice(0, 4));
    }).catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [kpOpen, setKpOpen] = useState(false);
  const [compare, setCompare] = useState<number[]>([]);

  const toggleCompare = (id: number) =>
    setCompare(p => p.includes(id) ? p.filter(n => n !== id) : p.length < 4 ? [...p, id] : p);

  const handleSearch = () => {
    if (search.trim()) navigate(`/catalog?q=${encodeURIComponent(search.trim())}`);
    else navigate('/catalog');
  };

  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative bg-mesh">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="animate-float-up">
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-6 font-mono-tech text-xs">
              <Icon name="Activity" size={13} className="mr-1.5" /> Дистрибьютор · B2B & B2G поставки
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Медицинское оборудование <span className="text-gradient">нового поколения</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Поставляем сертифицированную технику для клиник и больниц. Действующие РУ, тендерное сопровождение и сервис под ключ.
            </p>

            <div className="mt-8 glass rounded-2xl p-2 flex items-center gap-2 max-w-xl">
              <div className="flex items-center gap-2 pl-2 flex-1">
                <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Поиск по названию или номеру РУ…"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
                />
              </div>
              <Button className="rounded-xl font-semibold shrink-0" onClick={handleSearch}>Найти</Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 font-mono-tech text-xs text-muted-foreground items-center">
              <span>Популярное:</span>
              {['Эндоскопия', 'Коагулятор', 'Кольпоскоп', 'С-дуга'].map(t => (
                <Link key={t} to={`/catalog?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-secondary px-2.5 py-0.5 hover:bg-accent transition-colors">{t}</Link>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[{ v: '180+', l: 'позиций в каталоге' }, { v: '12 лет', l: 'на рынке РФ' }, { v: '500+', l: 'довольных клиник' }].map(s => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-gradient">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-xl font-semibold h-11 px-6" onClick={() => setKpOpen(true)}>
                <Icon name="FileText" size={16} className="mr-2" /> Получить коммерческое предложение
              </Button>
              <Link to="/catalog">
                <Button variant="outline" className="rounded-xl h-11 px-6">
                  Смотреть каталог <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-float-up" style={{ animationDelay: '0.15s' }}>
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden glass p-2 hover-lift">
              <img src={HERO_IMG} alt="Медицинское оборудование" className="rounded-2xl w-full aspect-square object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 glass rounded-2xl px-4 py-3 flex items-center gap-3 glow-green animate-float-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon name="ShieldCheck" size={18} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">РУ Росздравнадзора</div>
                <div className="text-xs text-muted-foreground">100% сертифицировано</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="container py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ADVANTAGES.map((a, i) => (
            <div key={a.title} className="group rounded-2xl border border-border bg-card p-6 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon name={a.icon} size={24} />
              </div>
              <h3 className="mt-4 font-bold text-base">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Категории */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">КАТАЛОГ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Направления медицины</h2>
          </div>
          <Link to="/catalog">
            <Button variant="outline" className="rounded-xl hidden sm:flex">
              Весь каталог <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((c, i) => (
            <Link key={c.id} to={`/catalog?cat=${c.id}`}
              className="group text-left rounded-2xl border border-border bg-card p-6 hover-lift hover:border-primary/40 animate-float-up block"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon name={c.icon} size={24} />
                </div>
                <span className="font-mono-tech text-xs text-muted-foreground">{c.count} поз.</span>
              </div>
              <h3 className="mt-4 font-bold text-lg">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Смотреть <Icon name="ArrowRight" size={15} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные товары */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">ХИТЫ ПРОДАЖ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Популярное оборудование</h2>
          </div>
          <Link to="/catalog">
            <Button variant="outline" className="rounded-xl hidden sm:flex">
              Все товары <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {apiProducts.length === 0
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))
            : apiProducts.map((p, i) => {
                const inCompare = compare.includes(p.id);
                const inStock = p.status === 'in_stock';
                const thumb = p.photos?.[0] || HERO_IMG;
                return (
                  <div key={p.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover-lift animate-float-up"
                    style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className="relative aspect-square bg-secondary overflow-hidden">
                      <img src={thumb} alt={p.name} className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                      <button onClick={() => toggleCompare(p.id)}
                        className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${inCompare ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:text-primary'}`}
                        title="Сравнить">
                        <Icon name="GitCompare" size={16} />
                      </button>
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${inStock ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-primary' : 'bg-amber-500'}`} />
                          {inStock ? 'В наличии' : 'Под заказ'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <span className="font-mono-tech text-xs text-muted-foreground">{p.brand}</span>
                      <h3 className="mt-1 font-bold text-base leading-snug">{p.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.reg_name}</p>

                      {p.ru_number && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5">
                          <Icon name="FileCheck2" size={14} className="text-primary shrink-0" />
                          <span className="font-mono-tech text-[11px] font-semibold">{p.ru_number}</span>
                          {p.ru_valid && <span className="font-mono-tech text-[11px] text-muted-foreground ml-auto">до {p.ru_valid}</span>}
                        </div>
                      )}

                      <ul className="mt-3 space-y-1">
                        {p.specs?.slice(0, 3).map(s => (
                          <li key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon name="Check" size={13} className="text-primary shrink-0" /> {s}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">Цена по запросу</span>
                          <Icon name="Lock" size={14} className="text-muted-foreground" />
                        </div>
                        <Link to={`/catalog/${p.id}`}>
                          <Button variant="outline" className="w-full rounded-xl font-semibold">Подробнее</Button>
                        </Link>
                        <Button className="w-full rounded-xl font-semibold" onClick={() => setKpOpen(true)}>
                          Запросить цену и КП
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </section>

      {/* CTA тендер */}
      <section className="container py-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15 mb-4 font-mono-tech text-xs">
                <Icon name="Gavel" size={13} className="mr-1.5" /> 44-ФЗ · 223-ФЗ
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold leading-tight">Тендерный отдел под ключ</h2>
              <p className="mt-4 text-primary-foreground/85 max-w-lg">
                Подберём оборудование под техзадание, подготовим спецификацию и сопроводим закупку на всех этапах.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link to="/tender">
                <Button variant="secondary" className="rounded-xl font-semibold h-12 px-6 w-full sm:w-auto">
                  Подать заявку на тендер
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setKpOpen(true)}
                className="rounded-xl font-semibold h-12 px-6 border-white/30 bg-transparent text-white hover:bg-white hover:text-primary">
                Запросить КП
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Сравнение */}
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

      <KpModal open={kpOpen} onClose={() => setKpOpen(false)} />
    </ShopLayout>
  );
}