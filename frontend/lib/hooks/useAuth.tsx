'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/authApi';

interface User {
  userId: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser]         = useState<User | null>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  // On mount: validate existing token
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('eventhub_token') : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    authApi.getMe()
      .then((res: any) => {
        setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem('eventhub_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: any = await authApi.login(email, password);
    localStorage.setItem('eventhub_token', res.token);
    setToken(res.token);
    setUser(res.user);
    router.push('/');
  }, [router]);

  const register = useCallback(async (email: string, password: string) => {
    const res: any = await authApi.register(email, password);
    localStorage.setItem('eventhub_token', res.token);
    setToken(res.token);
    setUser(res.user);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('eventhub_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
