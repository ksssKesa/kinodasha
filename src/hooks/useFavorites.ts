'use client'

import { useEffect } from 'react'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { db } from '@/lib/firebase'
import { useAuthUser } from '@/hooks/useAuthUser'
import { useFavoritesStore } from '@/store/useFavoritesStore'

export function useFavorites() {
  const { user, loading: authLoading } = useAuthUser()
  const { favIds, isLoading, error, setFavIds, add, remove, setLoading, setError } =
    useFavoritesStore()

  // 1️⃣ Загрузить избранное из Firestore, когда известен user
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setFavIds([])
      return
    }

    setLoading(true)
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        const data = snap.data() as { favorites?: string[] } | undefined
        setFavIds(Array.isArray(data?.favorites) ? data.favorites : [])
      })
      .catch(err => {
        setError(err.message)
        toast.error('Не удалось загрузить избранное')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading])

  // 2️⃣ Переключить статус «избранного»
  async function toggleFavorite(movieId: string) {
    if (!user) {
      toast.error('Сначала войдите в систему')
      return
    }

    setLoading(true)
    const userRef = doc(db, 'users', user.uid)
    try {
      if (favIds.includes(movieId)) {
        await updateDoc(userRef, { favorites: arrayRemove(movieId) })
        remove(movieId)
        toast.success('Удалено из избранного')
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(movieId) })
        add(movieId)
        toast.success('Добавлено в избранное')
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Ошибка при обновлении избранного')
    } finally {
      setLoading(false)
    }
  }

  // 3️⃣ Проверка, есть ли фильм в избранном
  const isFavorite = (id: string) => favIds.includes(id)

  return {
    favIds,
    isLoading,   // true во время загрузки или обновления
    error,       // текст ошибки
    isFavorite,  // (id) => boolean
    toggleFavorite,
  }
}