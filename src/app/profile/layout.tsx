'use client'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user])

  // Пока проверяем — показываем заглушку
  if (loading || !user) return <div>Loading…</div>
  return <>{children}</>
}