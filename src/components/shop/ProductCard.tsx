import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Product } from '@/lib/api';
import { HERO_IMG } from '@/data/shop';

interface Props {
  product: Product;
  inCompare?: boolean;
  onCompare?: () => void;
  onKp?: () => void;
  animationDelay?: number;
}

export default function ProductCard({ product: p, inCompare, onCompare, onKp, animationDelay = 0 }: Props) {
  const inStock = p.status === 'in_stock';
  const thumb = p.photos?.[0] || HERO_IMG;

  return (
    <div
      className="group flex flex-col rounded-2xl border border-border bg-white overflow-hidden hover-lift animate-float-up shadow-sm"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Photo area — белый фон, фото по центру с padding */}
      <div className="relative bg-white px-4 pt-5 pb-2 flex items-center justify-center" style={{ minHeight: 200 }}>
        <img
          src={thumb}
          alt={p.name}
          className="w-full object-contain group-hover:scale-105 transition-transform duration-500"
          style={{ maxHeight: 180 }}
        />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            inStock ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-700'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-primary' : 'bg-amber-500'}`} />
            {inStock ? 'В наличии' : 'Под заказ'}
          </span>
        </div>

        {/* Compare button */}
        {onCompare && (
          <button
            onClick={onCompare}
            title="Добавить к сравнению"
            className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              inCompare
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white/80 text-muted-foreground border-border hover:text-primary hover:border-primary/40'
            }`}
          >
            <Icon name="GitCompare" size={15} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-0" />

      {/* Info */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-4">
        {/* Brand */}
        <span className="font-mono-tech text-xs text-muted-foreground mb-1">{p.brand}</span>

        {/* Name */}
        <h3 className="font-bold text-base leading-snug text-foreground">{p.name}</h3>

        {/* Reg name */}
        {p.reg_name && (
          <p className="mt-0.5 text-xs text-muted-foreground">{p.reg_name}</p>
        )}

        {/* РУ block */}
        {p.ru_number && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2.5 py-1.5">
            <Icon name="FileCheck2" size={13} className="text-primary shrink-0" />
            <span className="font-mono-tech text-[11px] font-semibold text-foreground">{p.ru_number}</span>
            {p.ru_valid && (
              <span className="font-mono-tech text-[11px] text-muted-foreground ml-auto whitespace-nowrap">до {p.ru_valid}</span>
            )}
          </div>
        )}

        {/* Specs */}
        {p.specs?.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {p.specs.slice(0, 3).map(s => (
              <li key={s} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Icon name="Check" size={13} className="text-primary shrink-0 mt-px" /> {s}
              </li>
            ))}
          </ul>
        )}

        {/* Price + buttons */}
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Цена по запросу</span>
            <Icon name="Lock" size={14} className="text-muted-foreground" />
          </div>

          <Link to={`/catalog/${p.id}`} className="block">
            <Button
              variant="outline"
              className="w-full rounded-xl font-semibold border-border hover:border-primary/50"
            >
              Подробнее
            </Button>
          </Link>

          <Button
            className="w-full rounded-xl font-semibold"
            onClick={onKp}
          >
            Запросить цену и КП
          </Button>
        </div>
      </div>
    </div>
  );
}
