import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { submitLead } from '@/lib/leadsApi';

interface Props { open: boolean; onClose: () => void; }

export default function ConsultModal({ open, onClose }: Props) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', org: '', comment: '' });

  if (!open) return null;
  const handleClose = () => { setSent(false); setForm({ name: '', phone: '', org: '', comment: '' }); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
        <button onClick={handleClose} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-secondary">
          <Icon name="X" size={18} />
        </button>
        {sent ? (
          <div className="text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4"><Icon name="Phone" size={32} /></div>
            <p className="font-display text-xl font-bold mb-2">Перезвоним!</p>
            <p className="text-muted-foreground text-sm">Ожидайте звонка в течение 30 минут в рабочее время.</p>
            <Button className="mt-5 rounded-xl w-full" onClick={handleClose}>Закрыть</Button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold mb-1">Получить консультацию</h2>
            <p className="text-sm text-muted-foreground mb-4">Специалист свяжется с вами в течение 30 минут</p>
            <form onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            setLoading(true);
            try {
              await submitLead({ type: 'consult', contact: form.name, org: form.org, phone: form.phone, comment: form.comment });
              setSent(true);
            } finally { setLoading(false); }
          }} className="space-y-3">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Имя *" className="rounded-xl" required />
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
              <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация" className="rounded-xl" />
              <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Кратко опишите задачу" className="rounded-xl" rows={3} />
              <Button type="submit" disabled={loading} className="w-full rounded-xl font-semibold h-11">
                <Icon name={loading ? 'Loader2' : 'Phone'} size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Отправляем…' : 'Перезвоните мне'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}