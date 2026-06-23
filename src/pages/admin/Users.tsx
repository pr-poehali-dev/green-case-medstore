import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { usersApi, SystemUser, CreateUserPayload } from '@/lib/api';
import { ROLES, ROLE_LEVEL, Role } from '@/lib/adminData';
import { useAuth } from '@/contexts/AuthContext';

const EMPTY_FORM: CreateUserPayload = { name: '', email: '', role: 'manager', password: '' };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<CreateUserPayload & { id?: number; is_active?: boolean }>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tempPw, setTempPw] = useState('');

  const load = () => {
    setLoading(true);
    usersApi.list().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const myLevel = ROLE_LEVEL[me?.role as Role] ?? 0;

  // Роли, которые текущий пользователь может назначать
  const assignableRoles = (Object.keys(ROLES) as Role[]).filter(
    r => ROLE_LEVEL[r] < myLevel
  );

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, role: assignableRoles[assignableRoles.length - 1] || 'manager' });
    setError('');
    setTempPw('');
    setModal('add');
  };

  const openEdit = (u: SystemUser) => {
    setForm({ id: u.id, name: u.name, email: u.email, role: u.role, password: '', is_active: u.is_active });
    setError('');
    setTempPw('');
    setModal('edit');
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      if (modal === 'add') {
        const res = await usersApi.create({ name: form.name, email: form.email, role: form.role, password: form.password || undefined });
        if (res.temp_password) setTempPw(res.temp_password);
        else { setModal(null); load(); }
      } else {
        await usersApi.update({ id: form.id!, name: form.name, email: form.email, role: form.role, is_active: form.is_active, password: form.password || undefined });
        setModal(null);
        load();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: SystemUser) => {
    await usersApi.update({ id: u.id, is_active: !u.is_active }).catch(() => {});
    load();
  };

  const canManage = (target: SystemUser) => {
    const targetLevel = ROLE_LEVEL[target.role as Role] ?? 0;
    return myLevel > targetLevel && target.id !== me?.id;
  };

  return (
    <AdminLayout title="Пользователи">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">Управление учётными записями сотрудников</p>
        <Button className="rounded-xl font-semibold" onClick={openAdd} disabled={assignableRoles.length === 0}>
          <Icon name="UserPlus" size={16} className="mr-2" /> Добавить пользователя
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Пользователь</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Последний вход</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : users.map(u => {
                    const role = ROLES[u.role as Role];
                    const isMe = u.id === me?.id;
                    const manageable = canManage(u);
                    return (
                      <tr key={u.id} className={`border-b border-border last:border-0 ${!u.is_active ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm select-none shrink-0">
                              {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-1.5">
                                {u.name}
                                {isMe && <span className="text-[10px] font-mono-tech bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Вы</span>}
                              </div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {role && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${role.color}`}>
                              <Icon name={role.icon} size={12} />
                              {role.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-primary' : 'bg-muted-foreground'}`} />
                            {u.is_active ? 'Активен' : 'Деактивирован'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono-tech text-xs text-muted-foreground">
                          {u.last_login
                            ? new Date(u.last_login).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : 'Ещё не входил'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {manageable && (
                              <>
                                <button
                                  onClick={() => openEdit(u)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                  title="Редактировать"
                                >
                                  <Icon name="Pencil" size={16} />
                                </button>
                                <button
                                  onClick={() => toggleActive(u)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors ${u.is_active ? 'text-muted-foreground hover:text-rose-600' : 'text-muted-foreground hover:text-primary'}`}
                                  title={u.is_active ? 'Деактивировать' : 'Активировать'}
                                >
                                  <Icon name={u.is_active ? 'UserX' : 'UserCheck'} size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {!loading && users.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="Users" size={36} className="mx-auto mb-2 opacity-40" />
            <p>Нет пользователей</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && !tempPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">
                {modal === 'add' ? 'Новый пользователь' : 'Редактировать пользователя'}
              </h2>
              <button onClick={() => setModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Полное имя *</label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="rounded-xl"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="rounded-xl"
                  placeholder="user@greencase.ru"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Роль *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {assignableRoles.map(r => (
                    <option key={r} value={r}>{ROLES[r].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Пароль {modal === 'add' ? '(оставьте пустым — сгенерируется автоматически)' : '(оставьте пустым — без изменений)'}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="rounded-xl"
                  placeholder="Минимум 8 символов"
                  autoComplete="new-password"
                />
              </div>
              {modal === 'edit' && (
                <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active ?? true}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Аккаунт активен</label>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
                <Icon name="AlertCircle" size={15} className="shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button variant="outline" onClick={() => setModal(null)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.email} className="flex-1 rounded-xl font-semibold">
                {saving && <Icon name="Loader2" size={16} className="animate-spin mr-2" />}
                {modal === 'add' ? 'Создать' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary password dialog */}
      {tempPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
              <Icon name="KeyRound" size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-center mb-1">Пользователь создан</h2>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Передайте временный пароль новому сотруднику. После первого входа рекомендуется его сменить.
            </p>
            <div className="rounded-xl bg-secondary p-4 text-center mb-5">
              <div className="text-xs text-muted-foreground mb-1">Временный пароль</div>
              <div className="font-mono-tech text-xl font-bold tracking-wider select-all">{tempPw}</div>
            </div>
            <Button
              className="w-full rounded-xl font-semibold"
              onClick={() => { setTempPw(''); setModal(null); load(); }}
            >
              <Icon name="Check" size={16} className="mr-2" /> Понятно, закрыть
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
