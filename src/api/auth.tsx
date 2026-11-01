import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, tokenStorage, UNAUTHORIZED_EVENT } from '@/shared/api/client';
import { queryCache } from '@/shared/api/queryCache';
import type { AuthUser, LoginRequest, LoginResponse } from '@/types';

export const authApi = {
  login: (body: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', body),
  me: () => apiClient.get<AuthUser>('/auth/me'),
  logout: () => apiClient.post<void>('/auth/logout'),
};

type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (body: LoginRequest & { remember: boolean }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'checking' : 'guest'
  );

  const resetSession = useCallback(() => {
    tokenStorage.clear();
    queryCache.clear();
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) resetSession();
      });
    return () => {
      cancelled = true;
    };
  }, [resetSession]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, resetSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, resetSession);
  }, [resetSession]);

  const login = useCallback(async ({ remember, ...body }: LoginRequest & { remember: boolean }) => {
    const { token, user: loggedIn } = await authApi.login(body);
    queryCache.clear();
    tokenStorage.set(token, remember);
    setUser(loggedIn);
    setStatus('authenticated');
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    resetSession();
  }, [resetSession]);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
