import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import { submitLead } from '@/lib/leadsApi';

const CONTACTS = [
  { icon: 'Phone', label: 'Телефон', val: '+7 495 000-00-00', href: 'tel:+74950000000' },
  { icon: 'Mail', label: 'Email', val: 'info@greencase.ru', href: 'mailto:info@greencase.ru' },
  { icon: 'MapPin', label: 'Адрес', val: 'Москва, ул. Медицинская, 1, офис 501' },
  { icon: 'Clock', label: 'Режим работы', val: 'Понедельник — Пятница, 9:00–18:00 МСК' },
];

const DEPARTMENTS = [
  { title: 'Отдел продаж', phone: '+7 495 000-00-01', email: 'sales@greencase.ru', icon: 'ShoppingCart' },
  { title: 'Тендерный отдел', phone: '+7 495 000-00-02', email: 'tender@greencase.ru', icon: 'Gavel' },
  { title: 'Сервисная служба', phone: '+7 495 000-00-03', email: 'service@greencase.ru', icon: 'Wrench' },
  { title: 'Бухгалтерия', phone: '+7 495 000-00-04', email: 'buh@greencase.ru', icon: 'Receipt' },
];

export default function ContactsPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', org: '', comment: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLead({
        type: 'contact',
        contact: form.name,
        org: form.org,
        phone: form.phone,
        email: form.email,
        comment: form.comment,
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopLayout>
      <div className="container py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Контакты</span>
        </div>

        <div className="mb-10">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">КОНТАКТЫ</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Свяжитесь с нами</h1>
          <p className="text-muted-foreground text-lg max-w-xl">Работаем по всей России. Ответим в течение рабочего дня.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            {CONTACTS.map(c => (
              <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon name={c.icon} size={22} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{c.label}</div>
                  {c.href
                    ? <a href={c.href} className="font-semibold hover:text-primary transition-colors">{c.val}</a>
                    : <div className="font-semibold">{c.val}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold text-lg mb-5">Написать нам</h2>
            {sent ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                  <Icon name="CheckCircle2" size={32} />
                </div>
                <p className="font-bold text-lg mb-2">Сообщение отправлено!</p>
                <p className="text-muted-foreground text-sm">Мы ответим вам в течение рабочего дня.</p>
                <Button className="mt-5 rounded-xl" variant="outline" onClick={() => setSent(false)}>Написать ещё</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ваше имя *" className="rounded-xl" required />
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
                </div>
                <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" className="rounded-xl" />
                <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация" className="rounded-xl" />
                <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Вопрос или комментарий" className="rounded-xl" rows={4} />
                <Button type="submit" disabled={loading} className="w-full rounded-xl font-semibold h-11">
                  <Icon name={loading ? 'Loader2' : 'Send'} size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Отправляем…' : 'Отправить сообщение'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-5">Контакты отделов</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENTS.map((d, i) => (
              <div key={d.title} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon name={d.icon} size={22} />
                </div>
                <h3 className="font-bold text-sm mb-3">{d.title}</h3>
                <a href={`tel:${d.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-1">
                  <Icon name="Phone" size={13} /> {d.phone}
                </a>
                <a href={`mailto:${d.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="Mail" size={13} /> {d.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}