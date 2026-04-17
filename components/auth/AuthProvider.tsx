'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id?: string;
  email?: string;
  username?: string;
  name?: string;
  full_name?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const USERID_KEY = 'userId';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  return safeJsonParse<User>(localStorage.getItem(USER_KEY));
}

function setCachedUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAllAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USERID_KEY);
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  localStorage.removeItem('name');
  localStorage.removeItem('full_name');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false

  const init = async () => {
    const t = getToken()
    if (cancelled) return
    setTok(t)

    // ✅ No token = not logged in
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store',
      })

      if (cancelled) return

      // ✅ Token invalid/expired
      if (!res.ok) {
        clearAllAuth()
        setToken(null)
        setTok(null)
        setUser(null)
        setLoading(false)
        return
      }

      const me = await res.json()

      const email = (me?.email || localStorage.getItem('email') || '').trim()
      if (email) {
        localStorage.setItem('email', email)
        localStorage.setItem('userId', email) // ✅ for logs
      }

      const username = (
        me?.username ||
        localStorage.getItem('username') ||
        (email ? email.split('@')[0] : '')
      ).trim()

      const fullName = (
        me?.full_name ||
        me?.name ||
        localStorage.getItem('full_name') ||
        username
      ).trim()

      const nextUser: User = {
        ...(me || {}),
        email: email || undefined,
        username: username || undefined,
        name: me?.name || username || undefined,
        full_name: fullName || undefined,
      }

      localStorage.setItem('username', username)
      localStorage.setItem('name', nextUser.name || username)
      localStorage.setItem('full_name', fullName)

      setCachedUser(nextUser)
      setUser(nextUser)
    } catch {
      if (cancelled) return
      clearAllAuth()
      setToken(null)
      setTok(null)
      setUser(null)
    } finally {
      if (cancelled) return
      setLoading(false)
    }
  }

  init()

  return () => {
    cancelled = true
  }
}, [BACKEND_URL])

  async function login(email: string, password: string) {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail) throw new Error('Email is required');
  if (!password) throw new Error('Password is required');

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Invalid credentials');
  }

  const data = await res.json();
  const accessToken = data?.access_token || data?.token;
  const backendUser = data?.user;

  if (!accessToken) throw new Error('Login failed: token missing');

  // ✅ store token
  setToken(accessToken);
  setTok(accessToken);

  // ✅ user id for logs
  localStorage.setItem(USERID_KEY, cleanEmail);
  localStorage.setItem('email', cleanEmail);

  // ✅ cache user from backend if present
  const username = cleanEmail.split('@')[0];
  const nextUser: User = {
    ...(backendUser || {}),
    email: backendUser?.email || cleanEmail,
    username: backendUser?.username || username,
    name: backendUser?.name || username,
    full_name: backendUser?.full_name || backendUser?.name || username,
  };

  localStorage.setItem('username', nextUser.full_name || nextUser.username || username);
  localStorage.setItem('name', nextUser.name || username);
  localStorage.setItem('full_name', nextUser.full_name || username);

  setCachedUser(nextUser);
  setUser(nextUser);
}

  async function signup(email: string, password: string, full_name?: string) {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail) throw new Error('Email is required');
  if (!password) throw new Error('Password is required');

  const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      password,
      full_name: full_name?.trim() || null,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Signup failed');
  }

  // ✅ store only for convenience (optional)
  const username = cleanEmail.split('@')[0];
  const displayName = full_name?.trim() || username;

  localStorage.setItem('email', cleanEmail);
  localStorage.setItem('username', username);
  localStorage.setItem('name', username);
  localStorage.setItem('full_name', displayName);

  // ❌ do not setUser
  // ❌ do not setToken
}

  function logout() {
    clearAllAuth();
    setToken(null);
    setTok(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
