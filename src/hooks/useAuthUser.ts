'use client'

import { useContext } from 'react'
import { AuthContext } from '@/providers/AuthProvider'

/**
 * Хук для получения текущего user/loading
 * из нашего AuthContext.
 */
export function useAuthUser() {
  return useContext(AuthContext)
}