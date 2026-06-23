import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { CLIENTS, fmtMoney } from '@/lib/adminData';

export default function Clients() {
  return (
    <AdminLayout title="Клиенты">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-border bg-card px-3">
          <Icon name="Search" size={18} className="text-muted-foreground" />
          <Input placeholder="Поиск по названию или ИНН…" className="border-0 shadow-none focus-visible:ring-0 px-0" />
        </div>
        <Button className="rounded-xl font-semibold">
          <Icon name="Plus" size={16} className="mr-2" /> Добавить организацию
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIENTS.map((c, i) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5 hover-lift animate-float-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={c.type === 'state' ? 'Landmark' : 'Building2'} size={22} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.type === 'state' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'}`}>
                {c.type === 'state' ? 'Государственная' : 'Частная'}
              </span>
            </div>
            <h3 className="mt-3 font-bold text-base leading-snug">{c.name}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono-tech text-xs text-muted-foreground">
              <span>ИНН {c.inn}</span>
              <span>КПП {c.kpp}</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-secondary py-2">
                <div className="font-display text-lg font-bold">{c.deals}</div>
                <div className="text-[10px] text-muted-foreground">сделок</div>
              </div>
              <div className="rounded-xl bg-secondary py-2">
                <div className="font-display text-sm font-bold leading-tight pt-1">{(c.total / 1_000_000).toFixed(1)}М</div>
                <div className="text-[10px] text-muted-foreground">оборот</div>
              </div>
              <div className="rounded-xl bg-primary/10 py-2">
                <div className="font-display text-lg font-bold text-primary">{c.discount}%</div>
                <div className="text-[10px] text-muted-foreground">скидка</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl h-9">
                <Icon name="History" size={15} className="mr-1.5" /> История
              </Button>
              <Button variant="outline" className="rounded-xl h-9 w-9 p-0">
                <Icon name="Percent" size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
