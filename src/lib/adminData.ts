export type Role = 'developer' | 'admin' | 'manager' | 'content' | 'accountant';

export const ROLES: Record<Role, { label: string; color: string; icon: string }> = {
  developer: { label: 'Разработчик', color: 'bg-rose-100 text-rose-700', icon: 'Code2' },
  admin:     { label: 'Администратор', color: 'bg-primary/15 text-primary', icon: 'ShieldCheck' },
  manager:   { label: 'Менеджер по продажам', color: 'bg-blue-100 text-blue-700', icon: 'Briefcase' },
  content:   { label: 'Контент-менеджер', color: 'bg-purple-100 text-purple-700', icon: 'FileText' },
  accountant:{ label: 'Бухгалтер', color: 'bg-amber-100 text-amber-700', icon: 'Calculator' },
};

// Уровень доступа: чем выше — тем больше прав
export const ROLE_LEVEL: Record<Role, number> = {
  developer: 100,
  admin: 50,
  manager: 10,
  content: 10,
  accountant: 10,
};

export type ProductStatus = 'in_stock' | 'order' | 'discontinued';
export const PRODUCT_STATUS: Record<ProductStatus, { label: string; color: string; dot: string }> = {
  in_stock:     { label: 'В наличии',           color: 'bg-primary/10 text-primary',   dot: 'bg-primary' },
  order:        { label: 'Под заказ',            color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  discontinued: { label: 'Снят с производства', color: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500' },
};

export type LeadType = 'kp' | 'tender' | 'consult';
export const LEAD_TYPE: Record<LeadType, { label: string; icon: string; color: string }> = {
  kp:      { label: 'Запрос КП',    icon: 'FileText',      color: 'bg-primary/10 text-primary' },
  tender:  { label: 'Тендер',       icon: 'Gavel',         color: 'bg-blue-100 text-blue-700' },
  consult: { label: 'Консультация', icon: 'MessageCircle', color: 'bg-purple-100 text-purple-700' },
};

export type LeadStatus = 'new' | 'in_work' | 'kp_sent' | 'approval' | 'payment' | 'shipment' | 'closed';
export const LEAD_STATUS: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new',      label: 'Новая',          color: 'bg-slate-100 text-slate-700' },
  { key: 'in_work',  label: 'В работе',       color: 'bg-blue-100 text-blue-700' },
  { key: 'kp_sent',  label: 'КП отправлено',  color: 'bg-indigo-100 text-indigo-700' },
  { key: 'approval', label: 'Согласование',   color: 'bg-purple-100 text-purple-700' },
  { key: 'payment',  label: 'Оплата',         color: 'bg-amber-100 text-amber-700' },
  { key: 'shipment', label: 'Отгрузка',       color: 'bg-cyan-100 text-cyan-700' },
  { key: 'closed',   label: 'Закрыта',        color: 'bg-primary/10 text-primary' },
];

export const fmtMoney = (n: number) =>
  n === 0 ? '—' : new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
