import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/8cc5c4b0-536f-47f6-a8d2-d674659779ef/files/37cfd8dc-2290-45f5-b2b1-1d9ea96a9531.jpg';

const NAV = ['Каталог', 'Тендерный отдел', 'Сервис', 'Документы', 'Блог', 'Контакты'];

const CATEGORIES = [
  { name: 'Видеосистемы', icon: 'Video', count: 48, desc: 'Эндоскопия, лапароскопия, камеры' },
  { name: 'Гинекология', icon: 'Stethoscope', count: 32, desc: 'Кольпоскопы, кресла, наборы' },
  { name: 'Косметология', icon: 'Sparkles', count: 27, desc: 'Лазеры, аппараты, RF-системы' },
  { name: 'Отоларингология', icon: 'Ear', count: 21, desc: 'ЛОР-комбайны, аудиометры' },
  { name: 'Рентген аппараты', icon: 'ScanLine', count: 19, desc: 'Цифровые, мобильные, С-дуги' },
  { name: 'Электрохирургия', icon: 'Zap', count: 24, desc: 'Коагуляторы, аргон, аблация' },
];

const PRODUCTS = [
  {
    name: 'Эндоскопическая видеосистема Full HD',
    reg: 'Видеосистема медицинская',
    ru: 'РЗН 2023/19847',
    ruValid: 'до 12.2028',
    brand: 'MedTech Optix',
    status: 'in_stock',
    statusText: 'В наличии',
    specs: ['4K UHD сенсор', 'NBI-режим', 'Глубина 1.5–100 мм'],
  },
  {
    name: 'Кольпоскоп оптический бинокулярный',
    reg: 'Кольпоскоп КС-01',
    ru: 'РЗН 2022/16204',
    ruValid: 'до 06.2027',
    brand: 'GynoVision',
    status: 'order',
    statusText: 'Под заказ · 14 дней',
    specs: ['Увеличение ×4–×25', 'LED 50 000 ч', 'Зелёный фильтр'],
  },
  {
    name: 'Аппарат электрохирургический ЭХВЧ',
    reg: 'Коагулятор ЭХ-400',
    ru: 'РЗН 2023/18091',
    ruValid: 'до 09.2028',
    brand: 'ElectroSurg',
    status: 'in_stock',
    statusText: 'В наличии',
    specs: ['Мощность 400 Вт', 'Аргон-режим', 'Биполяр LigaSure'],
  },
  {
    name: 'Рентген-аппарат мобильный цифровой',
    reg: 'Рентген РМ-Digital',
    ru: 'РЗН 2021/14730',
    ruValid: 'до 03.2026',
    brand: 'RadioPro',
    status: 'order',
    statusText: 'Под заказ · 30 дней',
    specs: ['Детектор 35×43 см', 'Доза −40%', 'Мобильная С-дуга'],
  },
];

const ADVANTAGES = [
  { icon: 'ShieldCheck', title: 'Все РУ Росздравнадзора', desc: 'Поставляем только зарегистрированное оборудование с действующими удостоверениями' },
  { icon: 'Gavel', title: 'Работа по 44-ФЗ и 223-ФЗ', desc: 'Сопровождаем тендеры, готовим документацию и спецификации под закупку' },
  { icon: 'Wrench', title: 'Сервис и обслуживание', desc: 'Гарантия, ввод в эксплуатацию, обучение персонала и ТО на местах' },
  { icon: 'Truck', title: 'Поставки по всей России', desc: 'Прямые контракты с производителями, склад в Москве, логистика в регионы' },
];

function StatusBadge({ status, text }: { status: string; text: string }) {
  const inStock = status === 'in_stock';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        inStock ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-primary animate-pulse-ring' : 'bg-amber-500'}`} />
      {text}
    </span>
  );
}

export default function Index() {
  const [compare, setCompare] = useState<string[]>([]);

  const toggleCompare = (name: string) =>
    setCompare((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : prev.length < 4 ? [...prev, name] : prev
    );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-green">
              <Icon name="BriefcaseMedical" size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">Зеленый чемодан</div>
              <div className="font-mono-tech text-[10px] text-muted-foreground">MEDTECH DISTRIBUTION</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+74950000000" className="hidden md:flex items-center gap-2 font-mono-tech text-sm font-semibold">
              <Icon name="Phone" size={15} className="text-primary" />
              +7 495 000-00-00
            </a>
            <Button className="rounded-xl font-semibold">Получить КП</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-mesh">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="animate-float-up">
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-6 font-mono-tech text-xs">
              <Icon name="Activity" size={13} className="mr-1.5" />
              Дистрибьютор · B2B & B2G поставки
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Медицинское оборудование <span className="text-gradient">нового поколения</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Поставляем сертифицированную технику для клиник и больниц. Действующие РУ, тендерное сопровождение и сервис под ключ.
            </p>

            {/* Search */}
            <div className="mt-8 glass rounded-2xl p-2 flex items-center gap-2 max-w-xl">
              <div className="flex items-center gap-2 pl-2 flex-1">
                <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
                <Input
                  placeholder="Поиск по названию или номеру РУ…"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
                />
              </div>
              <Button className="rounded-xl font-semibold shrink-0">Найти</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 font-mono-tech text-xs text-muted-foreground items-center">
              <span>Популярное:</span>
              {['Эндоскопия', 'РЗН 2023', 'Коагулятор', 'С-дуга'].map((t) => (
                <button key={t} className="rounded-full bg-secondary px-2.5 py-0.5 hover:bg-accent transition-colors">
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { v: '180+', l: 'позиций в каталоге' },
                { v: '12 лет', l: 'на рынке РФ' },
                { v: '500+', l: 'довольных клиник' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-gradient">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
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

      {/* Advantages */}
      <section className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ADVANTAGES.map((a, i) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-border bg-card p-6 hover-lift animate-float-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon name={a.icon} size={24} />
              </div>
              <h3 className="mt-4 font-bold text-base">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">КАТАЛОГ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Направления медицины</h2>
          </div>
          <Button variant="outline" className="rounded-xl hidden sm:flex">
            Весь каталог <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.name}
              className="group text-left rounded-2xl border border-border bg-card p-6 hover-lift hover:border-primary/40 animate-float-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
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
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">ХИТЫ ПРОДАЖ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Популярное оборудование</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map((p, i) => {
            const selected = compare.includes(p.name);
            return (
              <div
                key={p.name}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover-lift animate-float-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="relative aspect-square bg-mesh flex items-center justify-center">
                  <img src={HERO_IMG} alt={p.name} className="h-full w-full object-cover opacity-90" />
                  <button
                    onClick={() => toggleCompare(p.name)}
                    className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      selected ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:text-primary'
                    }`}
                    title="Сравнить"
                  >
                    <Icon name="GitCompare" size={16} />
                  </button>
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={p.status} text={p.statusText} />
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <span className="font-mono-tech text-xs text-muted-foreground">{p.brand}</span>
                  <h3 className="mt-1 font-bold text-base leading-snug">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{p.reg}</p>

                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5">
                    <Icon name="FileCheck2" size={14} className="text-primary shrink-0" />
                    <span className="font-mono-tech text-[11px] font-semibold">{p.ru}</span>
                    <span className="font-mono-tech text-[11px] text-muted-foreground ml-auto">{p.ruValid}</span>
                  </div>

                  <ul className="mt-3 space-y-1">
                    {p.specs.map((s) => (
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
                    <Button className="w-full rounded-xl font-semibold">Запросить цену и КП</Button>
                    <Button variant="outline" className="w-full rounded-xl">
                      <Icon name="MessageCircle" size={15} className="mr-1.5" /> Консультация
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tender CTA */}
      <section className="container py-16">
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
                Подберём оборудование под техзадание, подготовим спецификацию и сопроводим вашу закупку на всех этапах.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Button variant="secondary" className="rounded-xl font-semibold h-12 px-6">
                Подать заявку на тендер
              </Button>
              <Button variant="outline" className="rounded-xl font-semibold h-12 px-6 border-white/30 bg-transparent text-white hover:bg-white hover:text-primary">
                Прикрепить файл ТЗ
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon name="BriefcaseMedical" size={20} />
              </div>
              <span className="font-display font-bold">Зеленый чемодан</span>
            </div>
            <p className="text-sm text-muted-foreground">Дистрибьютор медицинского оборудования для клиник и больниц по всей России.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.name}><a href="#" className="hover:text-primary transition-colors">{c.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Тендерный отдел', 'Сервис и обслуживание', 'Документы и лицензии', 'Блог', 'Контакты'].map((c) => (
                <li key={c}><a href="#" className="hover:text-primary transition-colors">{c}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Контакты</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="tel:+74950000000" className="flex items-center gap-2 hover:text-primary"><Icon name="Phone" size={15} /> +7 495 000-00-00</a>
              <a href="mailto:info@greencase.ru" className="flex items-center gap-2 hover:text-primary"><Icon name="Mail" size={15} /> info@greencase.ru</a>
              <p className="flex items-center gap-2"><Icon name="MapPin" size={15} /> Москва, ул. Медицинская, 1</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-5">
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <span>© 2026 Зеленый чемодан. Все права защищены.</span>
            <span className="font-mono-tech">Лицензия Росздравнадзора · ИНН 0000000000</span>
          </div>
        </div>
      </footer>

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-5 py-3 flex items-center gap-4 glow-green animate-float-up">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Icon name="GitCompare" size={16} className="text-primary" />
            Сравнение: {compare.length}/4
          </span>
          <Button className="rounded-xl font-semibold h-9">Сравнить</Button>
          <button onClick={() => setCompare([])} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>
      )}

      {/* Chat widget */}
      <div className="fixed bottom-5 right-5 z-50">
        <a href="#" className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-green hover-lift" title="Telegram">
          <Icon name="Send" size={22} />
        </a>
      </div>
    </div>
  );
}
