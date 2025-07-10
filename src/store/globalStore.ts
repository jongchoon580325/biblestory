import { create } from 'zustand';

// 글로벌 상태 타입 정의
interface GlobalState {
  darkMode: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  isLoading: boolean;
  notification: {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
  setDarkMode: (value: boolean) => void;
  setUser: (user: GlobalState['user']) => void;
  setLoading: (value: boolean) => void;
  setNotification: (open: boolean, message?: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * 글로벌 상태관리 스토어 (Zustand)
 * - 다크모드, 사용자, 로딩, 알림 등 공통 상태 관리
 */
export const useGlobalStore = create<GlobalState>((set) => ({
  darkMode: false,
  user: null,
  isLoading: false,
  notification: {
    open: false,
    message: '',
    type: 'info',
  },
  setDarkMode: (value) => set({ darkMode: value }),
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),
  setNotification: (open, message = '', type = 'info') => set({ notification: { open, message, type } }),
})); 