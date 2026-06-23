import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@greencase.ru');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-float-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-green">
            <Icon name="BriefcaseMedical" size={24} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold">Зеленый чемодан</div>
            <div className="font-mono-tech text-xs text-muted-foreground">ADMIN PANEL</div>
          </div>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl border border-border p-8 glow-green">
          <h1 className="font-display text-2xl font-bold mb-1">Вход в систему</h1>
          <p className="text-sm text-muted-foreground mb-6">Введите email и пароль для доступа к панели управления</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Email</label>
              <div className="relative">
                <Icon name="Mail" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@greencase.ru"
                  className="pl-9 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1.5 block">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPw ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl h-12 font-semibold text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={18} className="animate-spin" /> Входим…
                </span>
              ) : 'Войти в панель'}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-secondary px-4 py-3">
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">Демо-доступ</div>
            <div className="font-mono-tech text-xs space-y-0.5">
              <div><span className="text-muted-foreground">email:</span> admin@greencase.ru</div>
              <div><span className="text-muted-foreground">пароль:</span> Admin123!</div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Зеленый чемодан · Все данные защищены
        </p>
      </div>
    </div>
  );
}
