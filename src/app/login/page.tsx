'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { loginWithEmail, loginWithGoogle } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  // по email/password
  async function onEmailSubmit(email: string, password: string) {
    await loginWithEmail(email, password)
    router.replace('/')
  }

  // через Google
  async function onGoogleClick() {
    await loginWithGoogle()
    router.replace('/')
  }

  return (
    <main className="min-h-screen flex flex-col justify-center bg-black text-white p-4">
      <AuthForm title="Войти" onSubmit={onEmailSubmit}>
        <div className="text-center my-4">— или —</div>
        <button
          type="button"
          onClick={onGoogleClick}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Войти через Google
        </button>
      </AuthForm>

      <p className="text-center mt-4">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-pink-500 hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </main>
  )
}