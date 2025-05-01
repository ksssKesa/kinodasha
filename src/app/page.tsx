'use client'                       // нужна работа с хуками

import { logout } from '@/lib/auth'
import useAuthUser from '@/lib/hooks/useAuthUser'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuthUser()

  /** пока не знаем состояние авторизации — ничего не рендерим */
  if (loading) return null

  /* Если НЕ авторизован — показываем ссылки входа / регистрации */
  if (!user) {
    return (
      <main className="grid min-h-screen place-content-center gap-4">
        <h1 className="text-3xl font-bold">KinoDasha</h1>

        <Link href="/login" className="rounded bg-pink-600 px-5 py-2">
          Войти
        </Link>
        <Link href="/register" className="text-sm text-pink-400 underline">
          Регистрация
        </Link>
      </main>
    )
  }

  /* Авторизован — показываем e-mail и кнопку выхода */
  return (
    <main className="grid min-h-screen place-content-center gap-4">
      <h1 className="text-3xl font-bold">KinoDasha</h1>
      <p>{user.email}</p>

      <button onClick={logout} className="rounded bg-pink-600 px-5 py-2">
        Выйти
      </button>
    </main>
  )
}