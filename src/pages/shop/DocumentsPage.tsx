import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';

const DOCS = [
  { name: 'Лицензия Росздравнадзора №ФС-2026-1142', date: '15.01.2026', type: 'Лицензия', icon: 'FileCheck2', desc: 'На осуществление деятельности по обороту медицинских изделий' },
  { name: 'Свидетельство о государственной регистрации ЮЛ', date: '10.03.2018', type: 'Документ', icon: 'Building2', desc: 'ОГРН 1187746xxxxxx, ИФНС России №46 по г. Москве' },
  { name: 'Сертификат ISO 13485:2016', date: '01.09.2024', type: 'Сертификат', icon: 'Award', desc: 'Система менеджмента качества медицинских изделий' },
  { name: 'Лицензия на техническое обслуживание медизделий', date: '22.06.2025', type: 'Лицензия', icon: 'Wrench', desc: 'Техническое обслуживание и ремонт медицинской техники' },
  { name: 'Договор с уполномоченным представителем MedTech Optix', date: '01.01.2025', type: 'Договор', icon: 'Handshake', desc: 'Официальный дистрибьюторский договор для РФ' },
  { name: 'Договор с уполномоченным представителем ElectroSurg', date: '01.01.2024', type: 'Договор', icon: 'Handshake', desc: 'Официальный дистрибьюторский договор для РФ' },
];

const TYPE_COLORS: Record<string, string> = {
  'Лицензия':    'bg-primary/10 text-primary',
  'Сертификат':  'bg-amber-100 text-amber-700',
  'Документ':    'bg-blue-100 text-blue-700',
  'Договор':     'bg-purple-100 text-purple-700',
};

export default function DocumentsPage() {
  return (
    <ShopLayout>
      <div className="container py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Документы и лицензии</span>
        </div>

        <div className="mb-10">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">ДОКУМЕНТЫ</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Документы и лицензии</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Вся разрешительная документация на деятельность компании и дистрибьюторские договоры с производителями.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {DOCS.map((d, i) => (
            <div key={d.name} className="group flex gap-4 items-start rounded-2xl border border-border bg-card p-5 hover-lift hover:border-primary/40 transition-colors cursor-pointer animate-float-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <Icon name={d.icon} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${TYPE_COLORS[d.type] || ''}`}>{d.type}</span>
                  <span className="font-mono-tech text-xs text-muted-foreground">выдан {d.date}</span>
                </div>
                <div className="font-semibold text-sm leading-snug mb-1">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.desc}</div>
              </div>
              <Icon name="Download" size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
