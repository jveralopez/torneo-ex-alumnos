import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '../types/domain'
import * as authService from '../services/auth'

interface AuthStore {
  user: AdminUser | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await authService.login({ email, password })
          set({ user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({ user: null, isLoading: false })
        } catch {
          set({ isLoading: false })
          // Forzar logout local aunque el servidor falle
          set({ user: null, isLoading: false })
        }
      },

      checkAuth: async () => {
        if (!get().isInitialized) {
          set({ isLoading: true })
          try {
            const user = await authService.getCurrentUser()
            set({ user, isLoading: false, isInitialized: true })
          } catch {
            set({ isLoading: false, isInitialized: true })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Hook adicional para usar en componentes
import { useSyncExternalStore } from 'react'

function useStore<T>(selector: (state: AuthStore) => T): T {
  return useSyncExternalStore(
    (callback) => {
      const unsubscribe = useAuthStore.subscribe(callback)
      return unsubscribe
    },
    () => selector(useAuthStore.getState()),
    () => selector(useAuthStore.getState())
  )
}

export function useAuth() {
  const user = useStore((s) => s.user)
  const isLoading = useStore((s) => s.isLoading)
  const isInitialized = useStore((s) => s.isInitialized)
  
  const login = useAuthStore.getState().login
  const logout = useAuthStore.getState().logout
  const checkAuth = useAuthStore.getState().checkAuth

  // Inicializar auth al montar
  useSyncExternalStore(
    () => () => {},
    () => {
      if (!isInitialized) {
        checkAuth()
      }
    },
    () => isInitialized
  )

  return {
    user: isInitialized ? user : null,
    isLoading: isInitialized ? isLoading : true,
    isAuthenticated: isInitialized && !!user,
    login,
    logout,
  }
}