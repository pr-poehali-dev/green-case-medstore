import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CATEGORIES } from '@/data/shop';
import KpModal from './KpModal';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [kpOpen, setKpOpen] = useState(false);

  const NAV = [
    { label: 'Каталог',         to: '/catalog' },
    { label: 'Тендерный отдел', to: '/tender' },
    { label: 'Сервис',          to: '/service' },
    { label: 'Документы',       to: '/documents' },
    { label: 'Блог',            to: '/blog' },
    { label: 'Контакты',        to: '/contacts' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground glow-green">
              <Icon name="BriefcaseMedical" size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">Зеленый чемодан</div>
              <div className="font-mono-tech text-[10px] text-muted-foreground">MEDTECH DISTRIBUTION</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {NAV.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium transition-colors ${location.pathname.startsWith(l.to) ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:+74950000000" className="hidden md:flex items-center gap-2 font-mono-tech text-sm font-semibold">
              <Icon name="Phone" size={15} className="text-primary" /> +7 495 000-00-00
            </a>
            <Button className="rounded-xl font-semibold" onClick={() => setKpOpen(true)}>
              Получить КП
            </Button>
            <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary">
              <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card px-4 pb-4 animate-float-up">
            {NAV.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-medium text-foreground/80 hover:text-primary border-b border-border last:border-0 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-10 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon name="BriefcaseMedical" size={20} />
              </div>
              <span className="font-display font-bold">Зеленый чемодан</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Дистрибьютор медицинского оборудования для клиник и больниц по всей России.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <Link to={`/catalog?cat=${c.id}`} className="hover:text-primary transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {NAV.map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3">Контакты</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="tel:+74950000000" className="flex items-center gap-2 hover:text-primary"><Icon name="Phone" size={14} /> +7 495 000-00-00</a>
              <a href="mailto:info@greencase.ru" className="flex items-center gap-2 hover:text-primary"><Icon name="Mail" size={14} /> info@greencase.ru</a>
              <p className="flex items-start gap-2"><Icon name="MapPin" size={14} className="mt-0.5 shrink-0" /> Москва, ул. Медицинская, 1, офис 501</p>
            </div>
            <div className="flex gap-2 mt-4">
              <a href="https://t.me/greencase_med" target="_blank" rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#229ED9] text-white hover-lift" title="Telegram">
                <Icon name="Send" size={16} />
              </a>
              <a href="https://wa.me/74950000000" target="_blank" rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-white hover-lift" title="WhatsApp">
                <Icon name="MessageCircle" size={16} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-4">
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Зеленый чемодан. Все права защищены.</span>
            <span className="font-mono-tech">Лицензия Росздравнадзора · ИНН 0000000000</span>
          </div>
        </div>
      </footer>

      {/* Floating chat */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
        <a href="https://t.me/greencase_med" target="_blank" rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#229ED9] text-white shadow-lg hover-lift" title="Telegram">
          <Icon name="Send" size={20} />
        </a>
        <a href="https://wa.me/74950000000" target="_blank" rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg hover-lift" title="WhatsApp">
          <Icon name="MessageCircle" size={20} />
        </a>
      </div>

      <KpModal open={kpOpen} onClose={() => setKpOpen(false)} />
    </div>
  );
}
