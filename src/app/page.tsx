'use client'              

import Image from 'next/image'
import useAuthUser from '@/lib/hooks/useAuthUser'
import { loginWithGoogle, logout } from '@/lib/auth'

export default function Home() {
  const { user, loading } = useAuthUser()

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="animate-pulse">Загружаемся…</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">KinoDasha</h1>

      {user ? (
        <>
          {/* данные пользователя */}
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? 'avatar'}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <span>{user.displayName ?? user.email}</span>
          </div>

          {/* выход */}
          <button
            onClick={logout}
            className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            Выйти
          </button>
        </>
      ) : (
        /* вход */
        <button
          onClick={loginWithGoogle}
          className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Войти через Google
        </button>
      )}
    </main>
  )
}