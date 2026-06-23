const URLS = {
  auth:     'https://functions.poehali.dev/296e2b1f-8de8-4016-95b9-627cec7fc0b1',
  products: 'https://functions.poehali.dev/227d3485-38c9-4c9d-8327-eb262652830d',
  leads:    'https://functions.poehali.dev/58fcd52d-0bc7-48b8-9bc2-3f674b8c7ddc',
  clients:  'https://functions.poehali.dev/f0d2afab-ac86-410b-812b-106a07a3e668',
  content:  'https://functions.poehali.dev/268f72e1-4cfb-4312-8aae-8c7313536c77',
  users:    'https://functions.poehali.dev/14b0c44a-e76e-440b-851f-885e57db09d7',
};

function getToken(): string {
  return localStorage.getItem('gc_token') || '';
}

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    req<{ token: string; user: AdminUser }>(`${URLS.auth}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  me: () => req<AdminUser>(`${URLS.auth}?action=me`, { headers: authHeaders() }),
  logout: () => req(`${URLS.auth}?action=logout`, { method: 'POST', headers: authHeaders() }),
  changePassword: (old_password: string, new_password: string) =>
    req<{ ok: boolean; message: string }>(`${URLS.auth}?action=change-password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ old_password, new_password }),
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => req<SystemUser[]>(`${URLS.users}`, { headers: authHeaders() }),
  create: (data: CreateUserPayload) =>
    req<{ id: number; temp_password?: string; message?: string }>(`${URLS.users}`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    }),
  update: (data: UpdateUserPayload) =>
    req<{ ok: boolean }>(`${URLS.users}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    }),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: { q?: string; status?: string; category?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v))
    ).toString();
    return req<Product[]>(`${URLS.products}${qs ? '?' + qs : ''}`);
  },
  create: (data: Partial<Product>) =>
    req<{ id: number }>(`${URLS.products}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Product> & { id: number }) =>
    req<{ ok: boolean }>(`${URLS.products}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  remove: (id: number) =>
    req<{ ok: boolean }>(`${URLS.products}`, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) }),
  uploadPhoto: (data: string, mime: string) =>
    req<{ url: string; key: string }>(`${URLS.products}?action=upload-photo`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ data, mime }),
    }),
  csvImport: (csv: string) =>
    req<{ imported: number; errors: string[] }>(`${URLS.products}?action=csv-import`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ csv }),
    }),
};

// ── Leads ─────────────────────────────────────────────────────────────────────
export const leadsApi = {
  list: () => req<Lead[]>(`${URLS.leads}`, { headers: authHeaders() }),
  update: (data: { id: number; status?: string; manager?: string }) =>
    req<{ ok: boolean }>(`${URLS.leads}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
  getHistory: (lead_id: number) =>
    req<LeadHistoryItem[]>(`${URLS.leads}/history?lead_id=${lead_id}`, { headers: authHeaders() }),
  addHistory: (lead_id: number, text: string) =>
    req<{ ok: boolean }>(`${URLS.leads}/history`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ lead_id, text }) }),
};

// ── Clients ───────────────────────────────────────────────────────────────────
export const clientsApi = {
  list: (params?: { q?: string; type?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v))
    ).toString();
    return req<Client[]>(`${URLS.clients}${qs ? '?' + qs : ''}`, { headers: authHeaders() });
  },
  create: (data: Partial<Client>) =>
    req<{ id: number }>(`${URLS.clients}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Client> & { id: number }) =>
    req<{ ok: boolean }>(`${URLS.clients}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
};

// ── Content ───────────────────────────────────────────────────────────────────
export const contentApi = {
  list: () => req<Article[]>(`${URLS.content}`, { headers: authHeaders() }),
  create: (data: Partial<Article>) =>
    req<{ id: number }>(`${URLS.content}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }),
  update: (data: Partial<Article> & { id: number }) =>
    req<{ ok: boolean }>(`${URLS.content}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'developer' | 'admin' | 'manager' | 'content' | 'accountant';
}

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: 'developer' | 'admin' | 'manager' | 'content' | 'accountant';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  created_by: number | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface UpdateUserPayload {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  password?: string;
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
  photos: string[];
  complectation: string[];
  certs: string[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  type: 'kp' | 'tender' | 'consult' | 'contact';
  org: string;
  contact: string;
  phone: string;
  email: string;
  inn: string;
  amount: number;
  status: 'new' | 'in_work' | 'kp_sent' | 'approval' | 'payment' | 'shipment' | 'closed';
  manager: string;
  comment: string;
  product: string;
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