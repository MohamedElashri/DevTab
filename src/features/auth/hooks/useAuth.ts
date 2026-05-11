import { useCallback } from 'react'
import { AuthModalStore, AuthStore } from 'src/features/auth'

export const useAuth = () => {
  const authModalStore = AuthModalStore()
  const authStore = AuthStore()

  const isConnected = authStore.user != null

  const logout = useCallback(async () => {
    authStore.clear()
  }, [authStore])

  return {
    ...authModalStore,
    ...authStore,
    isConnected,
    logout,
  }
}
