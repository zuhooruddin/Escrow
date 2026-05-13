import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  avatar?: string;
  kyc: { status: 'pending' | 'submitted' | 'approved' | 'rejected'; documentType?: string; documentNumber?: string };
  bankDetails?: { bankName: string; accountTitle: string; iban: string; isVerified: boolean };
  stats: { totalDealsAsBuyer: number; totalDealsAsSeller: number; totalAmountEarned: number; totalAmountSpent: number };
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  setLoading: (v: boolean) => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (v) => set({ isLoading: v }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', formData);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try { await api.post('/auth/logout', { refreshToken }); } catch {}
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          set({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      updateUser: (userData) => set(state => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
    }),
    {
      name: 'escrowpk-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
