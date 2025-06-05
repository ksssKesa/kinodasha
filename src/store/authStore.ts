import { create } from 'zustand'
import type { User } from 'firebase/auth'

/** Тип состояния нашего стора */
export interface AuthState {
  /** Firebase-пользователь (или null) */
  user: User | null
  /** Пока подписка onAuthStateChanged ещё не вызвалась */
  loading: boolean
  /** Установить user */
  setUser: (user: User | null) => void
  /** Установить loading */
  setLoading: (loading: boolean) => void
}

/** Сам zustand-стор */
export const useAuthStore = create<AuthState>((set) => ({
  user:  null,
  loading: true,
  setUser:    (user)    => set({ user }),
  setLoading: (loading) => set({ loading }),
}))