'use client'

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

/** Кнопка «Войти через Google» */
export default function LoginButton() {
  return (
    <button
      onClick={loginWithGoogle}
      className="mt-4 w-full rounded bg-sky-600 px-5 py-2 text-white hover:bg-sky-500"
    >
      Войти через Google
    </button>
  )
}