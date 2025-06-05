'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/useAuthUser'

/**
 * Защищённая обёртка для страниц,
 * которая кидает на /login если пользователь не залогинен.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser()
  const router            = useRouter()

  // Как только loading закончился и user null — редиректим
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  // Пока ждём статус или нет юзера — ничего не рендерим
  if (loading || !user) return null

  return <>{children}</>
}