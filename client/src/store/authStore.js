import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        // Clear any previous session completely before new login
        set({ user: null, token: null, isAuthenticated: false, isLoading: true, error: null });
        delete api.defaults.headers.common['Authorization'];

        try {
          const { data } = await api.post('/auth/login', { email, password });
          // Set auth header BEFORE updating state
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true, user: data.user };
        } catch (err) {
          const message = err.response?.data?.message || 'Invalid email or password';
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
      },

      updateUser: (updates) => set({ user: { ...get().user, ...updates } }),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          // Token invalid — log out
          get().logout();
        }
      },
    }),
    {
      name: 'edunexus-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore axios auth header from persisted token on page refresh
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useAuthStore;
