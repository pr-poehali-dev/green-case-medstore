import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import KpModal from '@/components/shop/KpModal';
import ConsultModal from '@/components/shop/ConsultModal';
import { PRODUCTS, HERO_IMG, CATEGORIES } from '@/data/shop';

const TABS = ['Характеристики', 'Комплектация', 'Сертификаты'];

export default function ProductPage() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === Number(id));
  const [tab, setTab] = useState(0);
  const [kpOpen, setKpOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  if (!product) return <Navigate to="/catalog" replace />;

  const inStock = product.status === 'in_stock';
  const category = CATEGORIES.find(c => c.id === product.cat);

  return (
    <ShopLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
          <Icon name="ChevronRight" size={14} />
          {category && <>
            <Link to={`/catalog?cat=${category.id}`} className="hover:text-primary transition-colors">{category.name}</Link>
            <Icon name="ChevronRight" size={14} />
          </>}
          <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-10">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-2 bg-primary/10 blur-2xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card p-3">
              <img src={HERO_IMG} alt={product.name} className="w-full aspect-square object-cover rounded-2xl" />
            </div>
            <div className="absolute top-6 left-6">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${inStock ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
                {product.statusText}
              </span>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono-tech text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">{product.brand}</span>
              {category && <span className="font-mono-tech text-xs text-muted-foreground bg-secondary rounded-full px-2.5 py-1">{category.name}</span>}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-extrabold leading-tight mb-1">{product.name}</h1>
            <p className="text-muted-foreground text-sm mb-5">{product.regName}</p>

            {/* РУ block */}
            <div className="rounded-2xl border border-border bg-secondary p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                  <Icon name="FileCheck2" size={20} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Регистрационное удостоверение Росздравнадзора</div>
                  <div className="font-mono-tech text-base font-bold">{product.ru}</div>
                  <div className="font-mono-tech text-xs text-muted-foreground">действует до {product.ruValid}</div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.desc}</p>

            {/* Price & actions */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-display font-bold">Цена по запросу</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Цена зависит от комплектации и объёма закупки</div>
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

            {/* Compare & share */}
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl flex-1 h-10 text-sm">
                <Icon name="GitCompare" size={15} className="mr-1.5" /> Добавить к сравнению
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex border-b border-border">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`px-6 py-4 text-sm font-semibold transition-colors ${tab === i ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 1 && (
              <div className="space-y-2">
                {product.complectation.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                    <Icon name="Package" size={15} className="text-primary shrink-0" />
                    <span className="text-sm">{c}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 2 && (
              <div className="space-y-3">
                {product.certs.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-secondary px-4 py-3 hover:border-primary/40 transition-colors cursor-pointer group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <Icon name="FileCheck2" size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{c}</div>
                      <div className="text-xs text-muted-foreground">Нажмите для скачивания PDF</div>
                    </div>
                    <Icon name="Download" size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-6">Похожие товары</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 3).length === 0
              ? PRODUCTS.filter(p => p.id !== product.id).slice(0, 3).map(p => (
                  <Link key={p.id} to={`/catalog/${p.id}`}
                    className="group rounded-2xl border border-border bg-card p-4 hover-lift flex items-center gap-4 transition-colors hover:border-primary/40">
                    <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0">
                      <img src={HERO_IMG} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{p.name}</div>
                      <div className="font-mono-tech text-xs text-muted-foreground mt-1">{p.ru}</div>
                    </div>
                  </Link>
                ))
              : PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 3).map(p => (
                  <Link key={p.id} to={`/catalog/${p.id}`}
                    className="group rounded-2xl border border-border bg-card p-4 hover-lift flex items-center gap-4 transition-colors hover:border-primary/40">
                    <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0">
                      <img src={HERO_IMG} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{p.name}</div>
                      <div className="font-mono-tech text-xs text-muted-foreground mt-1">{p.ru}</div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </div>

      <KpModal open={kpOpen} onClose={() => setKpOpen(false)} productName={product.name} />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </ShopLayout>
  );
}
