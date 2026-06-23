import { useState, FormEvent } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { authApi } from '@/lib/api';
import { ROLES, Role } from '@/lib/adminData';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const roleInfo = ROLES[user?.role as Role];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPw.length < 8) {
      setError('Новый пароль должен содержать минимум 8 символов');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }
    if (oldPw === newPw) {
      setError('Новый пароль должен отличаться от текущего');
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.changePassword(oldPw, newPw);
      setSuccess(res.message || 'Пароль успешно изменён');
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка смены пароля');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Настройки аккаунта">
      <div className="max-w-lg space-y-5">
        {/* Info card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold select-none">
              {user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              {roleInfo && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1.5 ${roleInfo.color}`}>
                  <Icon name={roleInfo.icon} size={11} /> {roleInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold text-base mb-1">Смена пароля</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Используйте надёжный пароль длиной не менее 8 символов. После смены все другие активные сессии будут завершены.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Текущий пароль</label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showOld ? 'text' : 'password'}
                  value={oldPw}
                  onChange={e => setOldPw(e.target.value)}
                  className="pl-9 pr-10 rounded-xl"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowOld(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon name={showOld ? 'EyeOff' : 'Eye'} size={15} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Новый пароль</label>
              <div className="relative">
                <Icon name="KeyRound" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="pl-9 pr-10 rounded-xl"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Icon name={showNew ? 'EyeOff' : 'Eye'} size={15} />
                </button>
              </div>
              {newPw && (
                <div className="mt-2 flex gap-1">
                  {[8, 10, 12].map(len => (
                    <div key={len} className={`h-1 flex-1 rounded-full transition-colors ${newPw.length >= len ? 'bg-primary' : 'bg-border'}`} />
                  ))}
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {newPw.length < 8 ? 'Слишком короткий' : newPw.length < 10 ? 'Нормальный' : 'Надёжный'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Подтверждение нового пароля</label>
              <div className="relative">
                <Icon name="ShieldCheck" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className={`pl-9 rounded-xl ${confirmPw && confirmPw !== newPw ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                  autoComplete="new-password"
                  required
                />
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-rose-500 mt-1">Пароли не совпадают</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
                <Icon name="AlertCircle" size={15} className="shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5 text-sm text-primary">
                <Icon name="CheckCircle2" size={15} className="shrink-0" /> {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl font-semibold h-11"
              disabled={saving || !oldPw || !newPw || !confirmPw || newPw !== confirmPw}
            >
              {saving
                ? <span className="flex items-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" /> Сохраняем…</span>
                : 'Сменить пароль'}
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
