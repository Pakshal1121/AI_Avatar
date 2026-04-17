// lib/auth.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/* -------------------- TYPES -------------------- */

export interface User {
  id: number;
  email: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  user: User;
}

/* -------------------- STORAGE KEYS -------------------- */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/* -------------------- TOKEN HELPERS -------------------- */

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/* -------------------- USER CACHE HELPERS -------------------- */

export function setCachedUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getCachedUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/* -------------------- INTERNAL REQUEST -------------------- */

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* -------------------- AUTH API -------------------- */

export async function signup(
  email: string,
  password: string,
  full_name?: string
): Promise<TokenResponse> {
  return request<TokenResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  return request<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<User> {
  return request<User>('/api/auth/me');
}
