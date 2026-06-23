import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import KpModal from '@/components/shop/KpModal';
import ConsultModal from '@/components/shop/ConsultModal';
import { productsApi, Product } from '@/lib/api';
import { HERO_IMG } from '@/data/shop';

const TABS = ['Характеристики', 'Комплектация', 'Сертификаты'];

const CAT_MAP: Record<string, string> = {
  'Видеосистемы': 'video', 'Гинекология': 'gyn', 'Косметология': 'cosm',
  'Отоларингология': 'ent', 'Рентген аппараты': 'xray', 'Электрохирургия': 'elec',
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [kpOpen, setKpOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi.list().then(all => {
      const found = all.find(p => p.id === Number(id));
      if (!found) { navigate('/catalog', { replace: true }); return; }
      setProduct(found);
      setActivePhoto(0);
      setTab(0);
      setRelated(all.filter(p => p.id !== found.id && p.category === found.category && p.status !== 'discontinued').slice(0, 3));
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="aspect-square rounded-3xl bg-muted animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (!product) return null;

  const inStock = product.status === 'in_stock';
  const photos = product.photos?.length ? product.photos : [HERO_IMG];
  const catId = CAT_MAP[product.category] || '';

  return (
    <ShopLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
          <Icon name="ChevronRight" size={14} />
          {product.category && (
            <><Link to={`/catalog?cat=${catId}`} className="hover:text-primary transition-colors">{product.category}</Link>
            <Icon name="ChevronRight" size={14} /></>
          )}
          <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-10">
          {/* Photos */}
          <div>
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card p-2 mb-3 aspect-square">
              <img src={photos[activePhoto]} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute top-5 left-5">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${inStock ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                  <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
                  {inStock ? 'В наличии' : (product.status === 'order' ? 'Под заказ' : 'Снят с производства')}
                </span>
              </div>
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2">
                {photos.map((ph, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors ${activePhoto === i ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
                    <img src={ph} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.brand && <span className="font-mono-tech text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">{product.brand}</span>}
              {product.category && <span className="font-mono-tech text-xs text-muted-foreground bg-secondary rounded-full px-2.5 py-1">{product.category}</span>}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-extrabold leading-tight mb-1">{product.name}</h1>
            {product.reg_name && <p className="text-muted-foreground text-sm mb-5">{product.reg_name}</p>}

            {/* РУ block */}
            {product.ru_number && (
              <div className="rounded-2xl border border-border bg-secondary p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                    <Icon name="FileCheck2" size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Регистрационное удостоверение Росздравнадзора</div>
                    <div className="font-mono-tech text-base font-bold">{product.ru_number}</div>
                    {product.ru_valid && <div className="font-mono-tech text-xs text-muted-foreground">действует до {product.ru_valid}</div>}
                  </div>
                </div>
              </div>
            )}

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{product.description}</p>
            )}

            {/* Price & actions */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-display font-bold">Цена по запросу</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Зависит от комплектации и объёма закупки</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon name="Lock" size={18} />
                </div>
              </div>
              <Button className="w-full rounded-xl font-semibold h-12 text-base" onClick={() => setKpOpen(true)}>
                <Icon name="FileText" size={18} className="mr-2" /> Запросить цену и КП
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-xl font-semibold h-10" onClick={() => setConsultOpen(true)}>
                  <Icon name="MessageCircle" size={16} className="mr-1.5" /> Консультация
                </Button>
                <Button variant="outline" className="rounded-xl font-semibold h-10">
                  <Icon name="Paperclip" size={16} className="mr-1.5" /> Прикрепить ТЗ
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl h-10 text-sm">
              <Icon name="GitCompare" size={15} className="mr-1.5" /> Добавить к сравнению
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden mb-12">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${tab === i ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="p-6">
            {/* Характеристики */}
            {tab === 0 && (
              product.specs?.length ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {product.specs.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">Характеристики не указаны</p>
            )}

            {/* Комплектация */}
            {tab === 1 && (
              product.complectation?.length ? (
                <div className="space-y-2">
                  {product.complectation.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                      <Icon name="Package" size={15} className="text-primary shrink-0" />
                      <span className="text-sm">{c}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">Комплектация не указана</p>
            )}

            {/* Сертификаты */}
            {tab === 2 && (
              product.certs?.length ? (
                <div className="space-y-3">
                  {product.certs.map((c, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-secondary px-4 py-3 hover:border-primary/40 transition-colors cursor-pointer group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                        <Icon name="FileCheck2" size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{c}</div>
                        <div className="text-xs text-muted-foreground">Нажмите для скачивания</div>
                      </div>
                      <Icon name="Download" size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">Сертификаты не добавлены</p>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Похожие товары</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(p => (
                <Link key={p.id} to={`/catalog/${p.id}`}
                  className="group rounded-2xl border border-border bg-card p-4 hover-lift flex items-center gap-4 transition-colors hover:border-primary/40">
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-secondary">
                    <img src={p.photos?.[0] || HERO_IMG} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{p.name}</div>
                    {p.ru_number && <div className="font-mono-tech text-xs text-muted-foreground mt-1">{p.ru_number}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <KpModal open={kpOpen} onClose={() => setKpOpen(false)} productName={product.name} />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </ShopLayout>
  );
}
