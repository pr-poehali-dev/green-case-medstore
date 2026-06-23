import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import ConsultModal from '@/components/shop/ConsultModal';
import { useState } from 'react';

const SERVICES = [
  { icon: 'Settings', title: 'Пусконаладочные работы', desc: 'Ввод оборудования в эксплуатацию силами сертифицированных инженеров. Выезд в любой регион России.', price: 'по договору' },
  { icon: 'GraduationCap', title: 'Обучение персонала', desc: 'Инструктаж медицинского и технического персонала. Предоставляем сертификаты об обучении.', price: 'от 15 000 ₽' },
  { icon: 'ClipboardCheck', title: 'Плановое ТО', desc: 'Техническое обслуживание согласно регламенту производителя. Выездная и стационарная формы.', price: 'по договору' },
  { icon: 'LifeBuoy', title: 'Гарантийный ремонт', desc: 'Гарантия на всё оборудование от 12 месяцев. Сроки ремонта по договору — до 30 рабочих дней.', price: 'бесплатно' },
  { icon: 'PackageCheck', title: 'Поставка запчастей', desc: 'Оригинальные запасные части и расходные материалы. Склад в Москве, доставка по России.', price: 'по прайсу' },
  { icon: 'PhoneCall', title: 'Горячая линия', desc: 'Техническая поддержка 5/7 с 8:00 до 20:00 МСК. Удалённая диагностика и консультации.', price: 'бесплатно' },
];

export default function ServicePage() {
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    <ShopLayout>
      <div className="container py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Сервис и обслуживание</span>
        </div>

        <div className="mb-10">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">СЕРВИС</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Сервис и техническое обслуживание</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Полный цикл сервисного обслуживания медицинской техники. Сертифицированные инженеры, выезд по всей России.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={s.icon} size={24} />
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-1">{s.price}</span>
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Нужна консультация по обслуживанию?</h2>
            <p className="text-primary-foreground/80">Рассчитаем стоимость ТО и подберём оптимальный сервисный договор</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button variant="secondary" className="rounded-xl font-semibold h-12 px-6" onClick={() => setConsultOpen(true)}>
              <Icon name="Phone" size={16} className="mr-2" /> Получить консультацию
            </Button>
            <a href="tel:+74950000000">
              <Button variant="outline" className="rounded-xl font-semibold h-12 px-6 border-white/30 bg-transparent text-white hover:bg-white hover:text-primary w-full">
                +7 495 000-00-00
              </Button>
            </a>
          </div>
        </div>
      </div>
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </ShopLayout>
  );
}
