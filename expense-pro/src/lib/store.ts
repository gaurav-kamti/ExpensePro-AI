import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  mode: 'basic' | 'pro';
  toggleMode: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      mode: 'basic',
      toggleMode: () => set((state) => ({ mode: state.mode === 'basic' ? 'pro' : 'basic' })),
    }),
    { name: 'expense-pro-settings' }
  )
);