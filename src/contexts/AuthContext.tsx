import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, AdminUser } from '@/lib/api';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gc_token');
    if (!token) { setLoading(false); return; }

    const timeout = setTimeout(() => setLoading(false), 5000);

    authApi.me()
      .then(setUser)
      .catch(() => { localStorage.removeItem('gc_token'); })
      .finally(() => { clearTimeout(timeout); setLoading(false); });
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('gc_token', token);
    setUser(user);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('gc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}