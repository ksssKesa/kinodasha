'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthUser } from '@/hooks/useAuthUser'
import { Skeleton } from '@/components/Skeleton'
import { toast } from 'react-toastify'

interface Movie {
  id: string
  title: string
  year: string
  rating: number
  genre: string[]
  poster: string   
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuthUser()
  const [favIds, setFavIds] = useState<string[] | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [error, setError] = useState<string | null>(null)

  // 1) Получаем список ID-шек
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setFavIds([])
      return
    }

    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        const data = snap.data() as { favorites?: string[] }
        setFavIds(Array.isArray(data?.favorites) ? data.favorites : [])
      })
      .catch(err => setError(err.message))
  }, [authLoading, user])

  // 2) Подгружаем фильмы по ID
  useEffect(() => {
    if (!Array.isArray(favIds)) return
    Promise.all(
      favIds.map(id =>
        getDoc(doc(db, 'movies', id))
          .then(snap => (snap.exists() ? (snap.data() as Movie) : null))
      )
    )
      .then(list => {
        setMovies(list.filter(Boolean) as Movie[])
        if (list.length === 0) {
          toast.info('Список избранного пуст')
        }
      })
      .catch(err => setError(err.message))
  }, [favIds])

  if (authLoading || favIds === null) {
    // скелетоны для карточек
    return (
      <main className="p-4 bg-black text-white min-h-screen">
        <h1 className="text-2xl mb-4">Моё избранное</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-48" />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return <p className="p-4 text-red-500">Ошибка: {error}</p>
  }

  return (
    <main className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">Моё избранное</h1>

      {movies.length === 0 ? (
        <p>Пока нет сохранённых фильмов. <Link href="/">Перейти к списку</Link></p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {movies.map((m, i) => (
            <Link key={i} href={`/movies/${favIds[i]}`} className="block">
              <img
                src={`/posters/${m.poster}`} 
                alt={m.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h2 className="font-semibold">{m.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}