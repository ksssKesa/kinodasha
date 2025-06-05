'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  doc, getDoc, updateDoc,
  arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthUser } from '@/hooks/useAuthUser'
import { Skeleton } from '@/components/Skeleton'
import { toast } from 'react-toastify'

interface Movie {
  title: string
  year: string
  rating: number
  genre: string[]
  poster: string
  description?: string
}

export default function MovieDetailPage() {
  const { id: movieId } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, loading: authLoading } = useAuthUser()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1) Загрузка данных фильма
  useEffect(() => {
    if (!movieId) return
    setLoading(true)
    getDoc(doc(db, 'movies', movieId))
      .then(snap => {
        if (!snap.exists()) throw new Error('Фильм не найден')
        setMovie(snap.data() as Movie)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [movieId])

  // 2) Проверяем избранное
  useEffect(() => {
    if (!user || !movieId) return
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        const data = snap.data() as { favorites?: string[] }
        setIsFav(Array.isArray(data?.favorites) && data.favorites.includes(movieId))
      })
      .catch(() => {/* игнорируем */})
  }, [user, movieId])

  // 3) Переключаем избранное
  async function toggleFavorite() {
    if (!user || !movieId) return
    const userRef = doc(db, 'users', user.uid)
    try {
      await updateDoc(userRef, {
        favorites: isFav ? arrayRemove(movieId) : arrayUnion(movieId)
      })
      setIsFav(!isFav)
      toast.success(isFav ? 'Удалено из избранного' : 'Добавлено в избранное')
    } catch (e: any) {
      toast.error('Ошибка при обновлении избранного: ' + e.message)
    }
  }

  if (authLoading || loading) {
    // скелетон вместо сплошного "Загрузка..."
    return (
      <main className="p-4 bg-black text-white min-h-screen space-y-4">
        <Skeleton className="h-8 w-2/3" />       {/* заголовок */}
        <Skeleton className="h-64 w-full max-w-md" /> {/* постер */}
        <Skeleton className="h-4 w-1/2" />       {/* рейтинг */}
        <Skeleton className="h-4 w-1/3" />       {/* жанры */}
        <Skeleton className="h-4 w-full" />     {/* описание */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />    {/* кнопка */}
          <Skeleton className="h-10 w-32" />
        </div>
      </main>
    )
  }

  if (error) {
    return <p className="p-4 text-red-500">Ошибка: {error}</p>
  }
  if (!movie) {
    return <p className="p-4">Фильм не найден</p>
  }

  return (
    <main className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl mb-4">{movie.title} ({movie.year})</h1>
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full max-w-md mb-4 object-cover rounded"
      />
      <p className="mb-2">Рейтинг: {movie.rating}</p>
      <p className="mb-2">Жанры: {movie.genre.join(', ')}</p>
      {movie.description && <p className="mb-4">{movie.description}</p>}

      <div className="flex items-center gap-4">
        <button
          onClick={toggleFavorite}
          className={`px-4 py-2 rounded transition-colors ${
            isFav ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'
          }`}
        >
          {isFav ? 'Убрать из избранного' : 'В избранное'}
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ← На главную
        </button>
      </div>
    </main>
  )
}