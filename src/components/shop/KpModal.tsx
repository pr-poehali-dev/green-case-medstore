import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

export default function KpModal({ open, onClose, productName }: Props) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', org: '', inn: '', phone: '', email: '', comment: '' });

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); setSent(true); };
  const handleClose = () => { setSent(false); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
        <button onClick={handleClose} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-secondary">
          <Icon name="X" size={18} />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
              <Icon name="CheckCircle2" size={32} />
            </div>
            <p className="font-display text-xl font-bold mb-2">КП будет готово!</p>
            <p className="text-muted-foreground text-sm">Отправим коммерческое предложение на email в течение 2 рабочих часов.</p>
            <Button className="mt-5 rounded-xl w-full" onClick={handleClose}>Закрыть</Button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold mb-1">Запросить КП</h2>
            {productName && (
              <p className="text-sm text-muted-foreground mb-1">по позиции: <span className="font-semibold text-foreground">{productName}</span></p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ФИО *" className="rounded-xl" required />
              <Input value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Организация *" className="rounded-xl" required />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} placeholder="ИНН" className="rounded-xl" />
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Телефон *" className="rounded-xl" required />
              </div>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" type="email" className="rounded-xl" required />
              <Textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Комментарий, количество, ТЗ" className="rounded-xl" rows={3} />
              <Button type="submit" className="w-full rounded-xl font-semibold h-11">
                <Icon name="Send" size={16} className="mr-2" /> Отправить запрос
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
