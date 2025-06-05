'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { query, collection, getDocs } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { db, storage } from '@/lib/firebase'
import { Skeleton } from '@/components/Skeleton'

// 1) Выносим MovieCard в отдельный чанковый бандл, отключаем SSR
const MovieCard = dynamic(() => import('@/components/MovieCard'), {
  loading: () => <Skeleton className="w-full h-64" />,
  ssr: false,
})

interface Movie {
  id: string
  title: string
  year: string
  rating: number
  genre: string[]
  posterUrl: string
}

export default function HomePage() {
  const [movies, setMovies]       = useState<Movie[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // поиск / фильтрация / сортировка
  const [search, setSearch]           = useState('')
  const [genreFilter, setGenreFilter] = useState('Все')
  const [sortDesc, setSortDesc]       = useState(true)

  // 2) Загрузка данных из Firestore + получение URL картинки из Storage
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true)
      setError(null)
      try {
        const q    = query(collection(db, 'movies'))
        const snap = await getDocs(q)

        const arr: Movie[] = await Promise.all(
          snap.docs.map(async doc => {
            // расширяем тип, чтобы читать posterPath
            const data = doc.data() as {
              title: string
              year: string
              rating: number
              genre: string[]
              posterPath?: string
            }
            let url = '/placeholder.svg'
            if (data.posterPath) {
              try {
                url = await getDownloadURL(ref(storage, data.posterPath))
              } catch {
                // если не нашли — оставляем плейсхолдер
              }
            }
            return {
              id:        doc.id,
              title:     data.title,
              year:      data.year,
              rating:    data.rating,
              genre:     data.genre,
              posterUrl: url,
            }
          })
        )

        setMovies(arr)
        if (!toast.isActive('load-movies')) {
          toast.success('Список фильмов загружен', { toastId: 'load-movies' })
        }
      } catch (e) {
        console.error(e)
        setError('Не удалось загрузить фильмы')
        if (!toast.isActive('load-error')) {
          toast.error('Ошибка при загрузке фильмов', { toastId: 'load-error' })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  // собираем список жанров из загруженных фильмов
  const genres = useMemo(() => {
    const s = new Set<string>()
    movies.forEach(m => m.genre.forEach(g => s.add(g)))
    return ['Все', ...Array.from(s).sort()]
  }, [movies])

  // применяем поиск + фильтр + сортировку
  const visible = useMemo(() => {
    return movies
      .filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) &&
        (genreFilter === 'Все' || m.genre.includes(genreFilter))
      )
      .sort((a, b) => sortDesc ? b.rating - a.rating : a.rating - b.rating)
  }, [movies, search, genreFilter, sortDesc])

  if (error) {
    return (
      <main className="p-4 text-red-500">
        Ошибка: {error}
      </main>
    )
  }

  return (
    <>
      {/* единственный ToastContainer на страницу */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <main className="bg-black text-white min-h-screen p-4">
        <h1 className="text-3xl mb-6">Список фильмов</h1>

        {/* Search / Filter / Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="flex-1 bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded"
          />
          <select
            value={genreFilter}
            onChange={e => setGenreFilter(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={() => setSortDesc(d => !d)}
            className="bg-gray-800 text-white px-4 py-2 rounded"
          >
            Рейтинг {sortDesc ? '↓' : '↑'}
          </button>
        </div>

        {/* Сетка фильмов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-64" />
              ))
            : visible.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))
          }
        </div>
      </main>
    </>
  )
}