'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthUser } from '@/hooks/useAuthUser'
import { toast } from 'react-toastify'

interface Movie {
  id: string
  title: string
  year: string
  rating: number
  genre: string[]
  poster: string
  embedUrl: string
}

export default function MoviePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthUser()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fav, setFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)

  // Загружаем фильм
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'movies', params.id as string))
        if (snap.exists()) {
          const data = snap.data() as Omit<Movie, 'id'>
          setMovie({ id: params.id as string, ...data })
        } else {
          setError('Фильм не найден')
        }
      } catch (e) {
        setError('Ошибка загрузки фильма')
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  // Проверяем избранное
  useEffect(() => {
    if (!user) {
      setFav(false)
      return
    }
    const check = async () => {
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      const data = userSnap.data() as { favorites?: string[] }
      setFav(data?.favorites?.includes(params.id as string) ?? false)
    }
    check()
  }, [user, params.id])

  // Функция добавления/удаления из избранного
  async function handleFavClick() {
    if (!user) {
      toast.info('Авторизуйтесь для добавления в избранное')
      return
    }
    setFavLoading(true)
    const userRef = doc(db, 'users', user.uid)
    try {
      const snap = await getDoc(userRef)
      if (!snap.exists()) {
        // Если документа пользователя нет — создаём
        await setDoc(userRef, { favorites: [params.id] }, { merge: true })
        setFav(true)
        toast.success('Добавлено в избранное')
      } else {
        const data = snap.data() as { favorites?: string[] }
        if (data?.favorites?.includes(params.id as string)) {
          await updateDoc(userRef, { favorites: arrayRemove(params.id) })
          setFav(false)
          toast.info('Удалено из избранного')
        } else {
          await updateDoc(userRef, { favorites: arrayUnion(params.id) })
          setFav(true)
          toast.success('Добавлено в избранное')
        }
      }
    } catch (e) {
      toast.error('Ошибка при изменении избранного')
    }
    setFavLoading(false)
  }

  if (loading) return <main className="p-6 text-white">Загрузка…</main>
  if (error || !movie) return <main className="p-6 text-red-500">{error || 'Нет данных'}</main>

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <img
          src={`/posters/${movie.poster}`}
          alt={movie.title}
          className="rounded-lg shadow-lg w-[220px] h-[330px] object-cover mx-auto md:mx-0"
        />
        <div className="flex-1 flex flex-col justify-between gap-4">
          <h1 className="text-3xl font-bold mb-2">
            {movie.title} <span className="text-gray-400">({movie.year})</span>
          </h1>
          <div className="text-xl mb-2">
            <span className="text-yellow-400">★</span> Рейтинг: {movie.rating}
          </div>
          <div className="text-lg mb-4">
            Жанры: <span className="text-gray-200">{movie.genre.join(', ')}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleFavClick}
              disabled={favLoading}
              className={`px-5 py-2 rounded font-bold transition ${
                fav
                  ? 'bg-pink-600 hover:bg-pink-700'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {fav ? 'Добавлено в 🤍' : 'В избранное 🤍'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded font-bold transition"
            >
              ← На главную
            </button>
          </div>
        </div>
      </div>

      {/* Видео ниже шапки */}
      <div className="flex justify-center">
        {movie.embedUrl ? (
          <iframe
            src={movie.embedUrl}
            title={movie.title}
            width="900"
            height="506"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder={0}
            className="rounded-xl bg-black shadow-xl w-full max-w-[900px] aspect-video"
          />
        ) : (
          <div className="text-center text-gray-400 p-12">Видео недоступно</div>
        )}
      </div>
    </main>
  )
}