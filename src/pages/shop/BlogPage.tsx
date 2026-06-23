import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ShopLayout from '@/components/shop/ShopLayout';
import { HERO_IMG } from '@/data/shop';

const POSTS = [
  { id: 1, title: 'Как выбрать эндоскопическую стойку для клиники', tag: 'Статья', date: '20.06.2026', author: 'Отдел продаж', desc: 'Разбираем ключевые характеристики: разрешение матрицы, совместимость с эндоскопами, сервисная поддержка и соответствие требованиям Росздравнадзора.', readTime: '5 мин' },
  { id: 2, title: 'Новые поступления: цифровые рентген-аппараты 2026', tag: 'Новость', date: '18.06.2026', author: 'Редакция', desc: 'Обновили каталог цифровых рентген-аппаратов. Новинки от RadioPro с лучевой нагрузкой ниже на 40% — подходят для любых стационаров.', readTime: '3 мин' },
  { id: 3, title: 'Тендерное сопровождение по 44-ФЗ: пошаговый гайд', tag: 'Статья', date: '14.06.2026', author: 'Тендерный отдел', desc: 'Как правильно составить спецификацию, на что обратить внимание при подаче заявки и как избежать типичных ошибок при закупке медоборудования.', readTime: '8 мин' },
  { id: 4, title: 'ЛОР-оборудование: тренды и новинки 2026 года', tag: 'Статья', date: '10.06.2026', author: 'Отдел продаж', desc: 'Обзор актуальных решений для ЛОР-кабинетов: от классических комбайнов до систем с ИИ-анализом аудиограмм.', readTime: '6 мин' },
  { id: 5, title: 'Сертификация медизделий в 2026 году: что изменилось', tag: 'Новость', date: '05.06.2026', author: 'Редакция', desc: 'Росздравнадзор обновил требования к регистрационным удостоверениям. Рассказываем, как это влияет на закупки.', readTime: '4 мин' },
  { id: 6, title: 'Электрохирургия: выбор коагулятора для операционной', tag: 'Статья', date: '01.06.2026', author: 'Отдел продаж', desc: 'Сравниваем монополярные и биполярные системы, разбираем критерии выбора и требования к безопасности при работе с ЭХВЧ.', readTime: '7 мин' },
];

const TAG_COLORS: Record<string, string> = {
  'Новость': 'bg-blue-100 text-blue-700',
  'Статья':  'bg-purple-100 text-purple-700',
};

export default function BlogPage() {
  return (
    <ShopLayout>
      <div className="container py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-foreground font-medium">Блог</span>
        </div>

        <div className="mb-10">
          <Badge className="rounded-full bg-accent text-accent-foreground hover:bg-accent mb-4 font-mono-tech text-xs">БЛОГ</Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Новости и статьи</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Экспертные материалы о медицинском оборудовании, законодательстве и тендерной деятельности.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map((p, i) => (
            <article key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift animate-float-up cursor-pointer"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="relative h-44 overflow-hidden bg-mesh">
                <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${TAG_COLORS[p.tag] || ''}`}>{p.tag}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 font-mono-tech text-xs text-muted-foreground mb-2">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readTime} чтения</span>
                </div>
                <h2 className="font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors">{p.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3">{p.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.author}</span>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    Читать <Icon name="ArrowRight" size={14} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
