'use client'

import { useState, FormEvent } from 'react'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useRouter }   from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db }          from '@/lib/firebase'

export default function NewMoviePage() {
  const { user } = useAuthUser()
  const router   = useRouter()

  // Проверка, что это админ (например, по email)
  if (!user || user.email !== 'admin@yourdomain.com') {
    return <p>Доступ запрещён</p>
  }

  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [error, setError]       = useState<string|null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'movies'), {
        title,
        description: desc,
        posterUrl,
        createdAt: serverTimestamp(),
      })
      // редирект на список
      router.push('/movies')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl mb-4">Новый фильм</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Название"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Описание"
          className="w-full p-2 border rounded"
        />
        <input
          value={posterUrl}
          onChange={e => setPosterUrl(e.target.value)}
          placeholder="URL постера"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Добавить
        </button>
      </form>
    </main>
  )
}