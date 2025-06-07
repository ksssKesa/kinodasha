'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Movie {
  id: string
  title: string
  year: string
  rating: number
  poster: string
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'movies'))
        const data = snap.docs.map(doc => {
          const d = doc.data() as Omit<Movie, 'id'>
          // Если poster нет — подставляем плейсхолдер
          return {
            id: doc.id,
            ...d,
            poster: d.poster || 'placeholder.svg', // <-- добавь свой placeholder, если нужен
          }
        })
        setMovies(data)
      } catch (err) {
        console.error('Ошибка при загрузке фильмов', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Загрузка фильмов…</p>
      </main>
    )
  }

  return (
    <main className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map(movie => (
        <Link
          key={movie.id}
          href={`/movies/${movie.id}`}
          className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img
            src={`/posters/${movie.poster}`}
            alt={movie.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-2 bg-black text-white">
            <h3 className="font-semibold text-sm">{movie.title}</h3>
            <p className="text-xs mt-1">
              {movie.year} • {movie.rating.toFixed(1)}
            </p>
          </div>
        </Link>
      ))}
    </main>
  )
}