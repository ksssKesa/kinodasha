'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { registerWithEmail, loginWithGoogle } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()

  async function onEmailSubmit(email: string, password: string) {
    await registerWithEmail(email, password)
    router.replace('/')
  }

  async function onGoogleClick() {
    await loginWithGoogle()
    router.replace('/')
  }

  return (
    <main className="min-h-screen flex flex-col justify-center bg-black text-white p-4">
      <AuthForm title="Регистрация" onSubmit={onEmailSubmit}>
        <div className="text-center my-4">— или —</div>
        <button
          type="button"
          onClick={onGoogleClick}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Регистрация через Google
        </button>
      </AuthForm>

      <p className="text-center mt-4">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-pink-500 hover:underline">
          Войти
        </Link>
      </p>
    </main>
  )
}