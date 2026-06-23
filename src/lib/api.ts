const URLS = {
  auth: 'https://functions.poehali.dev/296e2b1f-8de8-4016-95b9-627cec7fc0b1',
  products: 'https://functions.poehali.dev/227d3485-38c9-4c9d-8327-eb262652830d',
  leads: 'https://functions.poehali.dev/58fcd52d-0bc7-48b8-9bc2-3f674b8c7ddc',
  clients: 'https://functions.poehali.dev/f0d2afab-ac86-410b-812b-106a07a3e668',
  content: 'https://functions.poehali.dev/268f72e1-4cfb-4312-8aae-8c7313536c77',
};

function getToken(): string {
  return localStorage.getItem('gc_token') || '';
}

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    req<{ token: string; user: AdminUser }>(`${URLS.auth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  me: () =>
    req<AdminUser>(`${URLS.auth}/me`, { headers: authHeaders() }),
  logout: () =>
    req(`${URLS.auth}/logout`, { method: 'POST', headers: authHeaders() }),
};

// Products
export const productsApi = {
  list: (params?: { q?: string; status?: string; category?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<Product[]>(`${URLS.products}${qs ? '?' + qs : ''}`, { headers: authHeaders() });
  },
  create: (data: Partial<Product>) =>
    req<{ id: number }>(`${URLS.products}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Product> & { id: number }) =>
    req(`${URLS.products}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
};

// Leads
export const leadsApi = {
  list: () =>
    req<Lead[]>(`${URLS.leads}`, { headers: authHeaders() }),
  update: (data: { id: number; status?: string; manager?: string }) =>
    req(`${URLS.leads}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  getHistory: (lead_id: number) =>
    req<LeadHistoryItem[]>(`${URLS.leads}/history?lead_id=${lead_id}`, { headers: authHeaders() }),
  addHistory: (lead_id: number, text: string) =>
    req(`${URLS.leads}/history`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ lead_id, text }) }),
};

// Clients
export const clientsApi = {
  list: (params?: { q?: string; type?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<Client[]>(`${URLS.clients}${qs ? '?' + qs : ''}`, { headers: authHeaders() });
  },
  create: (data: Partial<Client>) =>
    req<{ id: number }>(`${URLS.clients}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Client> & { id: number }) =>
    req(`${URLS.clients}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
};

// Content
export const contentApi = {
  list: () => req<Article[]>(`${URLS.content}`, { headers: authHeaders() }),
  create: (data: Partial<Article>) =>
    req<{ id: number }>(`${URLS.content}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Article> & { id: number }) =>
    req(`${URLS.content}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
};

// Types
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'content' | 'accountant';
}

export interface Product {
  id: number;
  name: string;
  reg_name: string;
  category: string;
  brand: string;
  ru_number: string;
  ru_valid: string;
  status: 'in_stock' | 'order' | 'discontinued';
  specs: string[];
  description: string;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  type: 'kp' | 'tender' | 'consult';
  org: string;
  contact: string;
  phone: string;
  email: string;
  inn: string;
  amount: number;
  status: 'new' | 'in_work' | 'kp_sent' | 'approval' | 'payment' | 'shipment' | 'closed';
  manager: string;
  comment: string;
  created_at: string;
}

export interface LeadHistoryItem {
  id: number;
  lead_id: number;
  author: string;
  text: string;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  type: 'private' | 'state';
  discount: number;
  deals_count: number;
  total_amount: number;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  type: 'Новость' | 'Статья' | 'Документ';
  status: 'Опубликовано' | 'Черновик';
  body: string;
  author: string;
  created_at: string;
  updated_at: string;
}
