import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';

const STEPS = [
  { icon: 'Search', title: 'Мониторинг тендеров', desc: 'Отслеживаем закупки на zakupki.gov.ru, ЕИС и всех крупных ЭТП ежедневно.' },
  { icon: 'FileText', title: 'Подготовка документов', desc: 'Составляем техспецификацию под требования заказчика, формируем пакет документов.' },
  { icon: 'Handshake', title: 'Сопровождение закупки', desc: 'Участвуем в переговорах, отвечаем на запросы разъяснений, контролируем сроки.' },
  { icon: 'Truck', title: 'Поставка и монтаж', desc: 'Осуществляем поставку в срок, проводим пусконаладочные работы и сдачу объекта.' },
];

const LAWS = [
  { name: '44-ФЗ', title: 'Госзакупки', desc: 'Государственные больницы, поликлиники, НИИ', icon: 'Landmark' },
  { name: '223-ФЗ', title: 'Корпоративные закупки', desc: 'ФГУП, АО с государственным участием, госкорпорации', icon: 'Building2' },
];

export default function TenderPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', org: '', inn: '', phone: '', email: '', tender_num: '', equipment: '' });

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <ShopLayout>
      <div className="container py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Тендерный отдел</span>
        </div>

        <div className="mb-10">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">
            <Icon name="Gavel" size={13} className="mr-1.5" /> 44-ФЗ · 223-ФЗ
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Тендерный отдел</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Сопровождаем государственные и корпоративные закупки медицинского оборудования. Более 300 успешных тендеров по всей России.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {LAWS.map(l => (
            <div key={l.name} className="rounded-2xl border-2 border-border bg-card p-6 hover-lift hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={l.icon} size={24} />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-primary">{l.name}</div>
                  <div className="font-semibold">{l.title}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{l.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Как мы работаем</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-card p-5 hover-lift">
                <div className="font-display text-5xl font-bold text-primary/10 absolute top-4 right-4">{i + 1}</div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon name={s.icon} size={22} />
                </div>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Наши преимущества в тендерах</h2>
            <div className="space-y-3">
              {[
                { icon: 'Award', text: 'Аккредитация на 12 ЭТП (Сбер-АСТ, ЕЭТП, РТС-тендер и др.)' },
                { icon: 'Shield', text: 'Банковские гарантии для обеспечения заявки и контракта' },
                { icon: 'FileSearch', text: 'Мониторинг закупок под ваш профиль ежедневно' },
                { icon: 'Clock', text: 'Срок подготовки документов — от 1 рабочего дня' },
                { icon: 'Wallet', text: 'Работаем с НДС и без НДС, упрощённая система' },
                { icon: 'MapPin', text: 'Поставки во все регионы России включая Крайний Север' },
              ].map(i => (
                <div key={i.text} className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon name={i.icon} size={16} />
                  </div>
                  <span className="text-sm">{i.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold text-lg mb-5">Заявка на тендер</h2>
            {sent ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                  <Icon name="CheckCircle2" size={32} />
                </div>
                <p className="font-bold text-lg mb-2">Заявка принята!</p>
                <p className="text-muted-foreground text-sm">Специалист тендерного отдела свяжется с вами в течение 1 рабочего дня.</p>
                <Button className="mt-5 rounded-xl" variant="outline" onClick={() => setSent(false)}>Отправить ещё</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ФИО и должность *" className="rounded-xl" required />
                <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация *" className="rounded-xl" required />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="ИНН" className="rounded-xl" />
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
                </div>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="rounded-xl" required />
                <Input value={form.tender_num} onChange={e => setForm(f => ({ ...f, tender_num: e.target.value }))} placeholder="Номер тендера на zakupki.gov.ru" className="rounded-xl" />
                <Textarea value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Перечень оборудования или описание закупки" className="rounded-xl" rows={4} />
                <Button type="submit" className="w-full rounded-xl font-semibold h-11">
                  <Icon name="Send" size={16} className="mr-2" /> Отправить заявку
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
