export type Role = 'admin' | 'manager' | 'content' | 'accountant';

export const ROLES: Record<Role, { label: string; color: string; icon: string }> = {
  admin: { label: 'Администратор', color: 'bg-primary/15 text-primary', icon: 'ShieldCheck' },
  manager: { label: 'Менеджер по продажам', color: 'bg-blue-100 text-blue-700', icon: 'Briefcase' },
  content: { label: 'Контент-менеджер', color: 'bg-purple-100 text-purple-700', icon: 'FileText' },
  accountant: { label: 'Бухгалтер', color: 'bg-amber-100 text-amber-700', icon: 'Calculator' },
};

export type ProductStatus = 'in_stock' | 'order' | 'discontinued';
export const PRODUCT_STATUS: Record<ProductStatus, { label: string; color: string; dot: string }> = {
  in_stock: { label: 'В наличии', color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  order: { label: 'Под заказ', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  discontinued: { label: 'Снят с производства', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
};

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  ru: string;
  ruValid: string;
  status: ProductStatus;
  files: number;
}

export const ADMIN_PRODUCTS: AdminProduct[] = [
  { id: 1, name: 'Эндоскопическая видеосистема Full HD', category: 'Видеосистемы', brand: 'MedTech Optix', ru: 'РЗН 2023/19847', ruValid: '12.2028', status: 'in_stock', files: 3 },
  { id: 2, name: 'Кольпоскоп оптический бинокулярный', category: 'Гинекология', brand: 'GynoVision', ru: 'РЗН 2022/16204', ruValid: '06.2027', status: 'order', files: 2 },
  { id: 3, name: 'Аппарат электрохирургический ЭХВЧ', category: 'Электрохирургия', brand: 'ElectroSurg', ru: 'РЗН 2023/18091', ruValid: '09.2028', status: 'in_stock', files: 4 },
  { id: 4, name: 'Рентген-аппарат мобильный цифровой', category: 'Рентген аппараты', brand: 'RadioPro', ru: 'РЗН 2021/14730', ruValid: '03.2026', status: 'order', files: 3 },
  { id: 5, name: 'Лазер косметологический фракционный', category: 'Косметология', brand: 'DermaLaser', ru: 'РЗН 2020/12033', ruValid: '01.2025', status: 'discontinued', files: 1 },
  { id: 6, name: 'ЛОР-комбайн универсальный', category: 'Отоларингология', brand: 'ENT Systems', ru: 'РЗН 2023/17720', ruValid: '11.2028', status: 'in_stock', files: 2 },
];

export type LeadType = 'kp' | 'tender' | 'consult';
export const LEAD_TYPE: Record<LeadType, { label: string; icon: string; color: string }> = {
  kp: { label: 'Запрос КП', icon: 'FileText', color: 'bg-primary/10 text-primary' },
  tender: { label: 'Тендер', icon: 'Gavel', color: 'bg-blue-100 text-blue-700' },
  consult: { label: 'Консультация', icon: 'MessageCircle', color: 'bg-purple-100 text-purple-700' },
};

export type LeadStatus = 'new' | 'in_work' | 'kp_sent' | 'approval' | 'payment' | 'shipment' | 'closed';
export const LEAD_STATUS: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new', label: 'Новая', color: 'bg-slate-100 text-slate-700' },
  { key: 'in_work', label: 'В работе', color: 'bg-blue-100 text-blue-700' },
  { key: 'kp_sent', label: 'КП отправлено', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'approval', label: 'Согласование', color: 'bg-purple-100 text-purple-700' },
  { key: 'payment', label: 'Оплата', color: 'bg-amber-100 text-amber-700' },
  { key: 'shipment', label: 'Отгрузка', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'closed', label: 'Закрыта', color: 'bg-primary/10 text-primary' },
];

export interface Lead {
  id: number;
  type: LeadType;
  org: string;
  contact: string;
  phone: string;
  amount: number;
  status: LeadStatus;
  manager: string;
  date: string;
}

export const LEADS: Lead[] = [
  { id: 1042, type: 'kp', org: 'ГКБ №1 им. Пирогова', contact: 'Иванова Е.А.', phone: '+7 495 111-22-33', amount: 2400000, status: 'new', manager: 'Не назначен', date: '23.06.2026' },
  { id: 1041, type: 'tender', org: 'Клиника «МедСтандарт»', contact: 'Петров С.В.', phone: '+7 812 444-55-66', amount: 5800000, status: 'in_work', manager: 'Смирнов А.', date: '22.06.2026' },
  { id: 1040, type: 'consult', org: 'ООО «ДентаЛюкс»', contact: 'Сидорова М.И.', phone: '+7 495 777-88-99', amount: 0, status: 'kp_sent', manager: 'Козлова Н.', date: '22.06.2026' },
  { id: 1039, type: 'kp', org: 'Областная больница №4', contact: 'Морозов Д.К.', phone: '+7 343 222-33-44', amount: 1150000, status: 'approval', manager: 'Смирнов А.', date: '21.06.2026' },
  { id: 1038, type: 'tender', org: 'НИИ кардиологии', contact: 'Волкова О.П.', phone: '+7 495 333-44-55', amount: 9200000, status: 'payment', manager: 'Козлова Н.', date: '20.06.2026' },
  { id: 1037, type: 'kp', org: 'Медцентр «Здоровье+»', contact: 'Зайцев Р.А.', phone: '+7 861 555-66-77', amount: 760000, status: 'shipment', manager: 'Смирнов А.', date: '19.06.2026' },
  { id: 1036, type: 'consult', org: 'Санаторий «Сосны»', contact: 'Белов И.Н.', phone: '+7 499 888-99-00', amount: 430000, status: 'closed', manager: 'Козлова Н.', date: '18.06.2026' },
];

export interface Client {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  type: 'private' | 'state';
  deals: number;
  total: number;
  discount: number;
}

export const CLIENTS: Client[] = [
  { id: 1, name: 'ГКБ №1 им. Пирогова', inn: '7701234567', kpp: '770101001', type: 'state', deals: 12, total: 28400000, discount: 7 },
  { id: 2, name: 'Клиника «МедСтандарт»', inn: '7809876543', kpp: '780901001', type: 'private', deals: 8, total: 15600000, discount: 5 },
  { id: 3, name: 'ООО «ДентаЛюкс»', inn: '7712398745', kpp: '771201001', type: 'private', deals: 3, total: 2300000, discount: 0 },
  { id: 4, name: 'Областная больница №4', inn: '6634567890', kpp: '663401001', type: 'state', deals: 6, total: 9800000, discount: 10 },
  { id: 5, name: 'НИИ кардиологии', inn: '7745612398', kpp: '774501001', type: 'state', deals: 15, total: 41200000, discount: 12 },
];

export interface Article {
  id: number;
  title: string;
  type: 'Новость' | 'Статья' | 'Документ';
  status: 'Опубликовано' | 'Черновик';
  date: string;
  author: string;
}

export const ARTICLES: Article[] = [
  { id: 1, title: 'Как выбрать эндоскопическую стойку для клиники', type: 'Статья', status: 'Опубликовано', date: '20.06.2026', author: 'Козлова Н.' },
  { id: 2, title: 'Новые поступления: рентген-аппараты 2026', type: 'Новость', status: 'Опубликовано', date: '18.06.2026', author: 'Козлова Н.' },
  { id: 3, title: 'Лицензия Росздравнадзора №ФС-2026-1142', type: 'Документ', status: 'Опубликовано', date: '15.06.2026', author: 'Admin' },
  { id: 4, title: 'Обзор трендов medtech на 2026 год', type: 'Статья', status: 'Черновик', date: '14.06.2026', author: 'Козлова Н.' },
];

export const fmtMoney = (n: number) =>
  n === 0 ? '—' : new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
