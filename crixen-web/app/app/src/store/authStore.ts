import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  tier: 'starter' | 'free' | 'pro' | 'agency';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup' | 'forgot-password';
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  googleLogin: (code: string, mode?: 'login' | 'signup') => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  refreshUser: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  toggleAuthMode: () => void;
  setAuthMode: (mode: 'login' | 'signup' | 'forgot-password') => void;
}

// Decode JWT payload without a library
const decodeToken = (token: string): { exp?: number; id?: string; email?: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

// Check if a JWT token is expired
const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds, Date.now() in ms
  return payload.exp * 1000 < Date.now();
};

// Helper: clear all auth storage
const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

// Helper to get initial state from localStorage or sessionStorage
const getInitialState = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // If token exists but is expired, clear everything on load
  if (token && isTokenExpired(token)) {
    clearAuthStorage();
    return { token: null, user: null };
  }

  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user from storage', e);
  }

  // If we have a token but no user (or vice versa), clear both
  if ((token && !user) || (!token && user)) {
    clearAuthStorage();
    return { token: null, user: null };
  }

  return { token, user };
};

// Helper to store auth data (always uses localStorage)
const storeAuth = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authMode: 'signup',

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      storeAuth(data.token, data.user);
      set({ token: data.token, user: data.user, isAuthModalOpen: false });

      // Trigger extension sync
      if ((window as any).__crixenSyncAuth) {
        (window as any).__crixenSyncAuth();
      }

      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      storeAuth(data.token, data.user);
      set({ token: data.token, user: data.user, isAuthModalOpen: false });

      // Trigger extension sync
      if ((window as any).__crixenSyncAuth) {
        (window as any).__crixenSyncAuth();
      }

      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  googleLogin: async (code, mode = 'signup') => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google login failed');
      }

      const data = await response.json();
      storeAuth(data.token, data.user);
      set({ token: data.token, user: data.user, isAuthModalOpen: false });

      // Trigger extension sync
      if ((window as any).__crixenSyncAuth) {
        (window as any).__crixenSyncAuth();
      }

      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    // Clear extension auth first
    if ((window as any).__crixenClearAuth) {
      (window as any).__crixenClearAuth();
    }

    clearAuthStorage();
    set({ token: null, user: null });
  },

  openAuthModal: (mode) => set({ isAuthModalOpen: true, authMode: mode, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
  toggleAuthMode: () => set((state) => ({
    authMode: state.authMode === 'login' ? 'signup' : 'login',
    error: null
  })),
  setAuthMode: (mode) => set({ authMode: mode, error: null }),

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        // Server rejected the token — force logout
        if (response.status === 401) {
          get().logout();
        }
        return false;
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user });
      return true;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return false;
    }
  },

  validateSession: async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // No token = no session
    if (!token) {
      get().logout();
      return false;
    }

    // Client-side expiry check
    if (isTokenExpired(token)) {
      get().logout();
      return false;
    }

    // Server-side validation (also handles revoked tokens)
    const valid = await get().refreshUser();
    if (!valid) {
      // refreshUser already calls logout on 401
      return false;
    }

    return true;
  },
}));

