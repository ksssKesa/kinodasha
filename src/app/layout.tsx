import './globals.css'
import { ReactNode } from 'react'
import Link from 'next/link'
import { AuthProvider } from '@/providers/AuthProvider'
import { ClientProviders } from '@/components/ClientProviders'

export const metadata = {
  title: 'KinoDasha',
  description: 'Ваш персональный кино-портал',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head />
      <body className="bg-black text-white min-h-screen">
        {/* Вешаем все клиентские провайдеры (тосты и т.д.) */}
        <ClientProviders>
          {/* Провайдер аутентификации */}
          <AuthProvider>
            {/* Шапка */}
            <header className="p-4 border-b border-gray-700 flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                <Link href="/">KinoDasha</Link>
              </h1>
              <nav className="flex gap-4">
                <Link href="/profile" className="hover:underline">
                  Профиль
                </Link>
                <Link href="/favorites" className="hover:underline">
                  Моё избранное
                </Link>
              </nav>
            </header>

            {/* Основной контент */}
            <main className="p-4">{children}</main>
          </AuthProvider>
        </ClientProviders>
      </body>
    </html>
  )
}