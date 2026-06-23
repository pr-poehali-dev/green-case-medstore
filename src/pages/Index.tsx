import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const HERO_IMG = 'https://cdn.poehali.dev/projects/8cc5c4b0-536f-47f6-a8d2-d674659779ef/files/37cfd8dc-2290-45f5-b2b1-1d9ea96a9531.jpg';

const CATEGORIES = [
  { id: 'video', name: 'Видеосистемы', icon: 'Video', count: 48, desc: 'Эндоскопия, лапароскопия, камеры' },
  { id: 'gyn', name: 'Гинекология', icon: 'Stethoscope', count: 32, desc: 'Кольпоскопы, кресла, наборы' },
  { id: 'cosm', name: 'Косметология', icon: 'Sparkles', count: 27, desc: 'Лазеры, аппараты, RF-системы' },
  { id: 'ent', name: 'Отоларингология', icon: 'Ear', count: 21, desc: 'ЛОР-комбайны, аудиометры' },
  { id: 'xray', name: 'Рентген аппараты', icon: 'ScanLine', count: 19, desc: 'Цифровые, мобильные, С-дуги' },
  { id: 'elec', name: 'Электрохирургия', icon: 'Zap', count: 24, desc: 'Коагуляторы, аргон, аблация' },
];

const ALL_PRODUCTS = [
  { id: 1, name: 'Эндоскопическая видеосистема Full HD', cat: 'video', reg: 'Видеосистема медицинская', ru: 'РЗН 2023/19847', ruValid: 'до 12.2028', brand: 'MedTech Optix', status: 'in_stock', statusText: 'В наличии', specs: ['4K UHD сенсор', 'NBI-режим', 'Глубина 1.5–100 мм'], desc: 'Профессиональная эндоскопическая стойка с поддержкой 4K. Идеальна для диагностики и малоинвазивных вмешательств. Совместима с гибкими и жёсткими эндоскопами. Комплект включает монитор, процессор, источник света и стойку.' },
  { id: 2, name: 'Кольпоскоп оптический бинокулярный', cat: 'gyn', reg: 'Кольпоскоп КС-01', ru: 'РЗН 2022/16204', ruValid: 'до 06.2027', brand: 'GynoVision', status: 'order', statusText: 'Под заказ · 14 дней', specs: ['Увеличение ×4–×25', 'LED 50 000 ч', 'Зелёный фильтр'], desc: 'Бинокулярный кольпоскоп с плавной регулировкой увеличения. Светодиодная подсветка 50 000 часов, зелёный фильтр для сосудистых паттернов. Оснащён видеовыходом для записи.' },
  { id: 3, name: 'Аппарат электрохирургический ЭХВЧ', cat: 'elec', reg: 'Коагулятор ЭХ-400', ru: 'РЗН 2023/18091', ruValid: 'до 09.2028', brand: 'ElectroSurg', status: 'in_stock', statusText: 'В наличии', specs: ['Мощность 400 Вт', 'Аргон-режим', 'Биполяр LigaSure'], desc: 'Высокочастотный электрохирургический аппарат мощностью 400 Вт. Поддерживает монополярный и биполярный режимы, аргоновую коагуляцию. Сенсорный экран, 8 независимых каналов.' },
  { id: 4, name: 'Рентген-аппарат мобильный цифровой', cat: 'xray', reg: 'Рентген РМ-Digital', ru: 'РЗН 2021/14730', ruValid: 'до 03.2026', brand: 'RadioPro', status: 'order', statusText: 'Под заказ · 30 дней', specs: ['Детектор 35×43 см', 'Доза −40%', 'Мобильная С-дуга'], desc: 'Мобильный цифровой рентген-аппарат для палат и операционных. Плоскопанельный детектор 35×43 см, снижение дозы на 40% по сравнению с аналогами. Передача изображений по Wi-Fi.' },
  { id: 5, name: 'Лазер косметологический фракционный', cat: 'cosm', reg: 'Лазер дерматологический ФЛ-1550', ru: 'РЗН 2022/15810', ruValid: 'до 08.2027', brand: 'DermaLaser', status: 'in_stock', statusText: 'В наличии', specs: ['Длина волны 1550 нм', 'Мощность 30 Вт', 'Площадь пятна 7–15 мм'], desc: 'Фракционный эрбиевый лазер для омоложения, шлифовки и лечения рубцов. Микроимпульсный режим, минимальное время восстановления. 3 сменные насадки в комплекте.' },
  { id: 6, name: 'ЛОР-комбайн универсальный', cat: 'ent', reg: 'Комплекс ЛОР-хирургический', ru: 'РЗН 2023/17720', ruValid: 'до 11.2028', brand: 'ENT Systems', status: 'in_stock', statusText: 'В наличии', specs: ['5 функциональных модулей', 'Встроенный отоскоп', 'Видеоэндоскопия'], desc: 'Универсальная ЛОР-установка на 5 рабочих мест. Отоскоп, риноскоп, видеоэндоскоп, аудиометр и промывочная станция. Единое управление с сенсорной панели.' },
];

const ADVANTAGES = [
  { icon: 'ShieldCheck', title: 'Все РУ Росздравнадзора', desc: 'Поставляем только зарегистрированное оборудование с действующими удостоверениями' },
  { icon: 'Gavel', title: 'Работа по 44-ФЗ и 223-ФЗ', desc: 'Сопровождаем тендеры, готовим документацию и спецификации под закупку' },
  { icon: 'Wrench', title: 'Сервис и обслуживание', desc: 'Гарантия, ввод в эксплуатацию, обучение персонала и ТО на местах' },
  { icon: 'Truck', title: 'Поставки по всей России', desc: 'Прямые контракты с производителями, склад в Москве, логистика в регионы' },
];

const BLOG_POSTS = [
  { title: 'Как выбрать эндоскопическую стойку для клиники', tag: 'Статья', date: '20.06.2026', desc: 'Разбираем ключевые характеристики: разрешение матрицы, совместимость с эндоскопами, сервисная поддержка.' },
  { title: 'Новые поступления: рентген-аппараты 2026', tag: 'Новость', date: '18.06.2026', desc: 'Обновили каталог цифровых рентген-аппаратов. Новинки от RadioPro с дозой ниже на 40%.' },
  { title: 'Тендерное сопровождение по 44-ФЗ: пошаговый гайд', tag: 'Статья', date: '14.06.2026', desc: 'Как правильно составить спецификацию, на что обратить внимание при подаче заявки.' },
];

const DOCS = [
  { name: 'Лицензия Росздравнадзора №ФС-2026-1142', date: '15.01.2026', icon: 'FileCheck2' },
  { name: 'Свидетельство о регистрации ЮЛ', date: '10.03.2018', icon: 'Building2' },
  { name: 'Сертификат ISO 13485:2016', date: '01.09.2024', icon: 'Award' },
  { name: 'Лицензия на техническое обслуживание медизделий', date: '22.06.2025', icon: 'Wrench' },
];

const SERVICE_ITEMS = [
  { icon: 'Settings', title: 'Пусконаладочные работы', desc: 'Ввод оборудования в эксплуатацию силами сертифицированных инженеров. Выезд в любой регион России.' },
  { icon: 'GraduationCap', title: 'Обучение персонала', desc: 'Инструктаж медицинского и технического персонала. Предоставляем сертификаты об обучении.' },
  { icon: 'ClipboardCheck', title: 'Техническое обслуживание', desc: 'Плановое ТО согласно регламенту производителя. Выездная и стационарная формы обслуживания.' },
  { icon: 'LifeBuoy', title: 'Гарантийный ремонт', desc: 'Гарантия на всё оборудование от 12 месяцев. Сроки ремонта по договору — до 30 рабочих дней.' },
  { icon: 'PackageCheck', title: 'Поставка запчастей', desc: 'Оригинальные запасные части и расходные материалы. Склад в Москве, доставка по России.' },
  { icon: 'Phone', title: 'Горячая линия', desc: 'Техническая поддержка 5/7 с 8:00 до 20:00 МСК. Удалённая диагностика и консультации.' },
];

function StatusBadge({ status, text }: { status: string; text: string }) {
  const ok = status === 'in_stock';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-primary' : 'bg-amber-500'}`} />
      {text}
    </span>
  );
}

type ModalType = 'kp' | 'tender' | 'consult' | 'product' | null;

export default function Index() {
  const [compare, setCompare] = useState<number[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [searchQ, setSearchQ] = useState('');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof ALL_PRODUCTS[0] | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: '', org: '', inn: '', phone: '', email: '', comment: '', tender_num: '', equipment: '' });

  const catalogRef = useRef<HTMLElement>(null);
  const tenderRef = useRef<HTMLElement>(null);
  const serviceRef = useRef<HTMLElement>(null);
  const docsRef = useRef<HTMLElement>(null);
  const blogRef = useRef<HTMLElement>(null);
  const contactsRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const NAV_LINKS = [
    { label: 'Каталог', ref: catalogRef },
    { label: 'Тендерный отдел', ref: tenderRef },
    { label: 'Сервис', ref: serviceRef },
    { label: 'Документы', ref: docsRef },
    { label: 'Блог', ref: blogRef },
    { label: 'Контакты', ref: contactsRef },
  ];

  const toggleCompare = (id: number) =>
    setCompare(p => p.includes(id) ? p.filter(n => n !== id) : p.length < 4 ? [...p, id] : p);

  const filtered = ALL_PRODUCTS.filter(p =>
    (activeCat === 'all' || p.cat === activeCat) &&
    (searchQ === '' || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.ru.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const openProduct = (p: typeof ALL_PRODUCTS[0]) => { setSelectedProduct(p); setModal('product'); };
  const openKP = (p?: typeof ALL_PRODUCTS[0]) => { setSelectedProduct(p || null); setModal('kp'); setFormSent(false); };
  const openConsult = () => { setModal('consult'); setFormSent(false); };
  const openTender = () => { setModal('tender'); setFormSent(false); };
  const closeModal = () => { setModal(null); setSelectedProduct(null); };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-green">
              <Icon name="BriefcaseMedical" size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">Зеленый чемодан</div>
              <div className="font-mono-tech text-[10px] text-muted-foreground">MEDTECH DISTRIBUTION</div>
            </div>
          </button>
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.ref)}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+74950000000" className="hidden md:flex items-center gap-2 font-mono-tech text-sm font-semibold">
              <Icon name="Phone" size={15} className="text-primary" /> +7 495 000-00-00
            </a>
            <Button className="rounded-xl font-semibold" onClick={() => openKP()}>Получить КП</Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
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
                <Input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Поиск по названию или номеру РУ…"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
                  onKeyDown={e => e.key === 'Enter' && scrollTo(catalogRef)} />
              </div>
              <Button className="rounded-xl font-semibold shrink-0" onClick={() => scrollTo(catalogRef)}>Найти</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 font-mono-tech text-xs text-muted-foreground items-center">
              <span>Популярное:</span>
              {['Эндоскопия', 'РЗН 2023', 'Коагулятор', 'С-дуга'].map(t => (
                <button key={t} onClick={() => { setSearchQ(t); scrollTo(catalogRef); }}
                  className="rounded-full bg-secondary px-2.5 py-0.5 hover:bg-accent transition-colors">{t}</button>
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

      {/* ── Преимущества ───────────────────────────────────────────────────── */}
      <section className="container py-12">
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

      {/* ── Каталог ────────────────────────────────────────────────────────── */}
      <section ref={catalogRef} id="catalog" className="container py-12 scroll-mt-20">
        <div className="mb-8">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">КАТАЛОГ</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Оборудование по направлениям</h2>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setActiveCat('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeCat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'}`}>
            Все категории
          </button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeCat === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const inCompare = compare.includes(p.id);
            return (
              <div key={p.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="relative h-44 bg-mesh overflow-hidden">
                  <img src={HERO_IMG} alt={p.name} className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => toggleCompare(p.id)}
                    className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${inCompare ? 'bg-primary text-primary-foreground' : 'glass text-foreground hover:text-primary'}`}
                    title="Сравнить">
                    <Icon name="GitCompare" size={16} />
                  </button>
                  <div className="absolute top-3 left-3"><StatusBadge status={p.status} text={p.statusText} /></div>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <span className="font-mono-tech text-xs text-muted-foreground">{p.brand}</span>
                  <h3 className="mt-1 font-bold text-base leading-snug">{p.name}</h3>
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5">
                    <Icon name="FileCheck2" size={13} className="text-primary shrink-0" />
                    <span className="font-mono-tech text-[11px] font-semibold">{p.ru}</span>
                    <span className="font-mono-tech text-[11px] text-muted-foreground ml-auto">{p.ruValid}</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {p.specs.map(s => (
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
                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-xl font-semibold text-sm h-9" onClick={() => openKP(p)}>Запросить КП</Button>
                      <Button variant="outline" className="rounded-xl h-9 px-3" onClick={() => openProduct(p)} title="Подробнее">
                        <Icon name="Info" size={16} />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl h-9 text-sm" onClick={openConsult}>
                      <Icon name="MessageCircle" size={15} className="mr-1.5" /> Консультация
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Icon name="PackageOpen" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Ничего не найдено</p>
            <button onClick={() => { setSearchQ(''); setActiveCat('all'); }} className="mt-2 text-sm text-primary hover:underline">Сбросить фильтры</button>
          </div>
        )}
      </section>

      {/* ── Тендерный отдел ────────────────────────────────────────────────── */}
      <section ref={tenderRef} id="tender" className="scroll-mt-20 bg-mesh py-16">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">
                <Icon name="Gavel" size={13} className="mr-1.5" /> 44-ФЗ · 223-ФЗ
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Тендерный отдел под ключ</h2>
              <p className="text-muted-foreground mb-6">Специализируемся на государственных и корпоративных закупках. Подготовим спецификацию, соберём пакет документов и сопроводим вашу закупку на всех этапах.</p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: 'FileSearch', text: 'Мониторинг тендеров на zakupki.gov.ru и ЭТП' },
                  { icon: 'FileText', text: 'Подготовка технических спецификаций под ваши требования' },
                  { icon: 'Handshake', text: 'Сопровождение на всех этапах закупки' },
                  { icon: 'Award', text: 'Опыт в более чем 300 тендерах по всей России' },
                ].map(i => (
                  <div key={i.text} className="flex items-start gap-3 rounded-xl bg-card border border-border px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Icon name={i.icon} size={16} />
                    </div>
                    <span className="text-sm">{i.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-xl font-semibold" onClick={openTender}>
                  <Icon name="Send" size={16} className="mr-2" /> Подать заявку на тендер
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => openKP()}>
                  <Icon name="FileText" size={16} className="mr-2" /> Запросить КП
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-lg mb-5">Быстрая заявка на тендер</h3>
              {formSent && modal === null ? (
                <div className="text-center py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                    <Icon name="CheckCircle2" size={32} />
                  </div>
                  <p className="font-bold text-lg">Заявка принята!</p>
                  <p className="text-muted-foreground text-sm mt-2">Наш специалист свяжется с вами в течение 2 часов</p>
                  <Button className="mt-4 rounded-xl" variant="outline" onClick={() => setFormSent(false)}>Отправить ещё</Button>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setFormSent(true); }} className="space-y-3">
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ваше имя и должность" className="rounded-xl" required />
                  <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Название организации" className="rounded-xl" required />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="ИНН" className="rounded-xl" />
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон" className="rounded-xl" required />
                  </div>
                  <Input value={form.tender_num} onChange={e => setForm(f => ({ ...f, tender_num: e.target.value }))} placeholder="Номер тендера / лота (если есть)" className="rounded-xl" />
                  <Textarea value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Перечень оборудования или описание закупки" className="rounded-xl" rows={3} />
                  <Button type="submit" className="w-full rounded-xl font-semibold">Отправить заявку</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Сервис ─────────────────────────────────────────────────────────── */}
      <section ref={serviceRef} id="service" className="container py-16 scroll-mt-20">
        <div className="mb-8">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">СЕРВИС</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Сервис и техническое обслуживание</h2>
          <p className="mt-3 text-muted-foreground max-w-xl">Полный цикл сервисного обслуживания медицинской техники. Выезд по всей России, сертифицированные инженеры.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {SERVICE_ITEMS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Icon name={s.icon} size={22} />
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-primary text-primary-foreground p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <p className="font-bold text-lg">Нужна консультация по обслуживанию?</p>
            <p className="text-primary-foreground/80 text-sm mt-1">Рассчитаем стоимость ТО и подберём оптимальный сервисный договор</p>
          </div>
          <Button variant="secondary" className="rounded-xl font-semibold shrink-0" onClick={openConsult}>
            <Icon name="Phone" size={16} className="mr-2" /> Получить консультацию
          </Button>
        </div>
      </section>

      {/* ── Документы ──────────────────────────────────────────────────────── */}
      <section ref={docsRef} id="docs" className="bg-secondary/50 py-16 scroll-mt-20">
        <div className="container">
          <div className="mb-8">
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">ДОКУМЕНТЫ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Документы и лицензии</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOCS.map(d => (
              <div key={d.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover-lift cursor-pointer group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon name={d.icon} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-snug">{d.name}</div>
                  <div className="font-mono-tech text-xs text-muted-foreground mt-0.5">выдан {d.date}</div>
                </div>
                <Icon name="Download" size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Блог ───────────────────────────────────────────────────────────── */}
      <section ref={blogRef} id="blog" className="container py-16 scroll-mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">БЛОГ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Новости и статьи</h2>
          </div>
          <Button variant="outline" className="rounded-xl hidden sm:flex">Все статьи <Icon name="ArrowRight" size={16} className="ml-2" /></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOG_POSTS.map((b, i) => (
            <article key={b.title} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift animate-float-up cursor-pointer" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="h-36 bg-mesh relative overflow-hidden">
                <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${b.tag === 'Новость' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{b.tag}</span>
              </div>
              <div className="p-5">
                <div className="font-mono-tech text-xs text-muted-foreground mb-2">{b.date}</div>
                <h3 className="font-bold leading-snug mb-2 group-hover:text-primary transition-colors">{b.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{b.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                  Читать <Icon name="ArrowRight" size={15} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Контакты ───────────────────────────────────────────────────────── */}
      <section ref={contactsRef} id="contacts" className="bg-secondary/50 py-16 scroll-mt-20">
        <div className="container">
          <div className="mb-8">
            <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-3 font-mono-tech text-xs">КОНТАКТЫ</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Свяжитесь с нами</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                { icon: 'Phone', label: 'Телефон', val: '+7 495 000-00-00', href: 'tel:+74950000000' },
                { icon: 'Mail', label: 'Email', val: 'info@greencase.ru', href: 'mailto:info@greencase.ru' },
                { icon: 'MapPin', label: 'Адрес', val: 'Москва, ул. Медицинская, 1, офис 501' },
                { icon: 'Clock', label: 'Режим работы', val: 'Пн–Пт 9:00–18:00 МСК' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Icon name={c.icon} size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                    {c.href
                      ? <a href={c.href} className="font-semibold hover:text-primary transition-colors">{c.val}</a>
                      : <div className="font-semibold">{c.val}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-lg mb-5">Написать нам</h3>
              <form onSubmit={submitForm} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ваше имя" className="rounded-xl" required />
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон" className="rounded-xl" required />
                </div>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" className="rounded-xl" />
                <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация" className="rounded-xl" />
                <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Вопрос или комментарий" className="rounded-xl" rows={4} />
                <Button type="submit" className="w-full rounded-xl font-semibold">Отправить сообщение</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card">
        <div className="container py-10 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon name="BriefcaseMedical" size={20} /></div>
              <span className="font-display font-bold">Зеленый чемодан</span>
            </div>
            <p className="text-sm text-muted-foreground">Дистрибьютор медицинского оборудования для клиник и больниц по всей России.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORIES.map(c => (
                <li key={c.id}><button onClick={() => { setActiveCat(c.id); scrollTo(catalogRef); }} className="hover:text-primary transition-colors text-left">{c.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {NAV_LINKS.map(l => (
                <li key={l.label}><button onClick={() => scrollTo(l.ref)} className="hover:text-primary transition-colors text-left">{l.label}</button></li>
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
        <div className="border-t border-border py-4">
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Зеленый чемодан. Все права защищены.</span>
            <span className="font-mono-tech">Лицензия Росздравнадзора · ИНН 0000000000</span>
          </div>
        </div>
      </footer>

      {/* ── Панель сравнения ───────────────────────────────────────────────── */}
      {compare.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-5 py-3 flex items-center gap-4 glow-green animate-float-up shadow-xl">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="GitCompare" size={16} className="text-primary" />
            Сравнение: {compare.length}/4
          </div>
          <div className="flex gap-1">
            {compare.map(id => {
              const p = ALL_PRODUCTS.find(x => x.id === id);
              return p ? <span key={id} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium max-w-[120px] truncate">{p.name.split(' ').slice(0, 2).join(' ')}</span> : null;
            })}
          </div>
          <Button size="sm" className="rounded-xl font-semibold h-8">Сравнить</Button>
          <button onClick={() => setCompare([])} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={18} /></button>
        </div>
      )}

      {/* ── Виджет чата ────────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        <a href="https://t.me/greencase_med" target="_blank" rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#229ED9] text-white shadow-lg hover-lift" title="Telegram">
          <Icon name="Send" size={20} />
        </a>
        <a href="https://wa.me/74950000000" target="_blank" rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg hover-lift" title="WhatsApp">
          <Icon name="MessageCircle" size={20} />
        </a>
      </div>

      {/* ── Модальные окна ─────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          {/* Карточка товара */}
          {modal === 'product' && selectedProduct && (
            <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl overflow-y-auto max-h-[90vh] animate-float-up">
              <div className="relative h-48 bg-mesh overflow-hidden">
                <img src={HERO_IMG} alt={selectedProduct.name} className="h-full w-full object-cover opacity-70" />
                <button onClick={closeModal} className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl glass text-foreground hover:text-primary">
                  <Icon name="X" size={18} />
                </button>
                <div className="absolute bottom-4 left-4"><StatusBadge status={selectedProduct.status} text={selectedProduct.statusText} /></div>
              </div>
              <div className="p-6">
                <div className="font-mono-tech text-xs text-muted-foreground mb-1">{selectedProduct.brand}</div>
                <h2 className="font-display text-2xl font-bold mb-1">{selectedProduct.name}</h2>
                <p className="text-sm text-muted-foreground mb-1">{selectedProduct.reg}</p>
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 mb-4 inline-flex">
                  <Icon name="FileCheck2" size={14} className="text-primary" />
                  <span className="font-mono-tech text-xs font-semibold">{selectedProduct.ru}</span>
                  <span className="font-mono-tech text-xs text-muted-foreground">· действует {selectedProduct.ruValid}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{selectedProduct.desc}</p>
                <div className="mb-5">
                  <h3 className="font-bold text-sm mb-2">Технические характеристики</h3>
                  <ul className="space-y-1.5">
                    {selectedProduct.specs.map(s => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={14} className="text-primary shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 rounded-xl font-semibold" onClick={() => { closeModal(); setTimeout(() => openKP(selectedProduct), 100); }}>
                    <Icon name="FileText" size={16} className="mr-2" /> Запросить цену и КП
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { closeModal(); setTimeout(openConsult, 100); }}>
                    <Icon name="MessageCircle" size={16} className="mr-2" /> Консультация
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Форма КП */}
          {modal === 'kp' && (
            <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
              <button onClick={closeModal} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-secondary"><Icon name="X" size={18} /></button>
              {formSent ? (
                <div className="text-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4"><Icon name="CheckCircle2" size={32} /></div>
                  <p className="font-display text-xl font-bold mb-2">КП будет готово!</p>
                  <p className="text-muted-foreground text-sm">Мы отправим коммерческое предложение на указанный email в течение 2 рабочих часов.</p>
                  <Button className="mt-5 rounded-xl w-full" onClick={closeModal}>Закрыть</Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold mb-1">Запросить КП</h2>
                  {selectedProduct && <p className="text-sm text-muted-foreground mb-4">по позиции: <span className="font-semibold text-foreground">{selectedProduct.name}</span></p>}
                  <form onSubmit={e => { e.preventDefault(); setFormSent(true); }} className="space-y-3 mt-4">
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ФИО *" className="rounded-xl" required />
                    <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация *" className="rounded-xl" required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="ИНН" className="rounded-xl" />
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
                    </div>
                    <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="rounded-xl" required />
                    <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Комментарий, количество, ТЗ" className="rounded-xl" rows={3} />
                    <Button type="submit" className="w-full rounded-xl font-semibold h-11">
                      <Icon name="Send" size={16} className="mr-2" /> Отправить запрос
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Форма консультации */}
          {modal === 'consult' && (
            <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
              <button onClick={closeModal} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-secondary"><Icon name="X" size={18} /></button>
              {formSent ? (
                <div className="text-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4"><Icon name="Phone" size={32} /></div>
                  <p className="font-display text-xl font-bold mb-2">Перезвоним!</p>
                  <p className="text-muted-foreground text-sm">Ожидайте звонка в течение 30 минут в рабочее время.</p>
                  <Button className="mt-5 rounded-xl w-full" onClick={closeModal}>Закрыть</Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold mb-1">Получить консультацию</h2>
                  <p className="text-sm text-muted-foreground mb-4">Наш специалист свяжется с вами в течение 30 минут</p>
                  <form onSubmit={e => { e.preventDefault(); setFormSent(true); }} className="space-y-3">
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя *" className="rounded-xl" required />
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
                    <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация" className="rounded-xl" />
                    <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Кратко опишите задачу" className="rounded-xl" rows={3} />
                    <Button type="submit" className="w-full rounded-xl font-semibold h-11">
                      <Icon name="Phone" size={16} className="mr-2" /> Перезвоните мне
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Форма тендера */}
          {modal === 'tender' && (
            <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-secondary"><Icon name="X" size={18} /></button>
              {formSent ? (
                <div className="text-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4"><Icon name="Gavel" size={32} /></div>
                  <p className="font-display text-xl font-bold mb-2">Заявка принята!</p>
                  <p className="text-muted-foreground text-sm">Специалист тендерного отдела свяжется с вами в течение 1 рабочего дня.</p>
                  <Button className="mt-5 rounded-xl w-full" onClick={closeModal}>Закрыть</Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold mb-1">Заявка на тендер</h2>
                  <p className="text-sm text-muted-foreground mb-4">Заполните форму — мы подготовим спецификацию и сопроводим закупку</p>
                  <form onSubmit={e => { e.preventDefault(); setFormSent(true); }} className="space-y-3">
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ФИО и должность *" className="rounded-xl" required />
                    <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация *" className="rounded-xl" required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="ИНН" className="rounded-xl" />
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
                    </div>
                    <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="rounded-xl" required />
                    <Input value={form.tender_num} onChange={e => setForm(f => ({ ...f, tender_num: e.target.value }))} placeholder="Номер тендера на zakupki.gov.ru" className="rounded-xl" />
                    <Textarea value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Перечень оборудования / требования" className="rounded-xl" rows={4} />
                    <Button type="submit" className="w-full rounded-xl font-semibold h-11">
                      <Icon name="Gavel" size={16} className="mr-2" /> Отправить заявку
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
