'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAuthUser }    from '@/hooks/useAuthUser'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db }             from '@/lib/firebase'
import { logout }         from '@/lib/auth'
import Link               from 'next/link'

interface ProfileData {
  email: string
  displayName: string
}

export default function ProfilePage() {
  const { user } = useAuthUser()
  // локальный стейт формы
  const [profile, setProfile] = useState<ProfileData>({ email: '', displayName: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string|null>(null)
  const [success, setSuccess] = useState(false)

  // Загрузить данные из Firestore
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<ProfileData>
          setProfile({
            email:       data.email ?? user.email!,
            displayName: data.displayName ?? user.displayName ?? ''
          })
        } else {
          // если ещё нет документа, заполним initial
          setProfile({ email: user.email!, displayName: user.displayName ?? '' })
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user])

  // Обработчик сабмита
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await setDoc(
        doc(db, 'users', user!.uid),
        {
          email:       profile.email,
          displayName: profile.displayName,
          lastLogin:   Date.now()
        },
        { merge: true }
      )
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-4 text-center">Loading…</p>

  return (
    <main className="max-w-md mx-auto py-8">
      <h1 className="text-2xl mb-4">Мой профиль</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">E-mail</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Имя</label>
          <input
            type="text"
            value={profile.displayName}
            onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded"
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-400">Сохранено!</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded"
        >
          {saving ? 'Сохраняем…' : 'Сохранить изменения'}
        </button>
      </form>

      <div className="mt-6 space-x-4 text-center">
        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          Выйти
        </button>
        <Link href="/" className="text-pink-500 hover:underline">
          На главную
        </Link>
      </div>
    </main>
  )
}