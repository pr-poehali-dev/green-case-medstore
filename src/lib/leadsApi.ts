const LEADS_URL = 'https://functions.poehali.dev/58fcd52d-0bc7-48b8-9bc2-3f674b8c7ddc';

export interface LeadPayload {
  type: 'kp' | 'tender' | 'consult' | 'contact';
  contact: string;
  org?: string;
  phone: string;
  email?: string;
  inn?: string;
  comment?: string;
  product?: string;
  tender_num?: string;
}

export async function submitLead(payload: LeadPayload): Promise<{ id: number }> {
  const res = await fetch(LEADS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}
