'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthUser } from '@/hooks/useAuthUser'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const { user, loading } = useAuthUser()
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null)

  // Подгружаем данные пользователя из Firestore (имя, аватар)
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      const data = snap.data() || {}
      setName(data.name || user.displayName || '')
      setAvatarUrl(data.avatarUrl || user.photoURL || '')
    })
  }, [user])

  // Получаем количество избранных фильмов
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      const data = snap.data() || {}
      setFavoritesCount(Array.isArray(data.favorites) ? data.favorites.length : 0)
    })
  }, [user])

  // Показываем предпросмотр выбранной картинки
  useEffect(() => {
    if (photoFile) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(photoFile)
    } else {
      setPreview(null)
    }
  }, [photoFile])

  const handleEdit = () => setEdit(true)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPhotoFile(file || null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setSuccess(false)
    let newAvatarUrl = avatarUrl

    // Если выбрана новая аватарка — загружаем в Firebase Storage
    if (photoFile && user) {
      try {
        const avatarRef = ref(storage, `avatars/${user.uid}`)
        await uploadBytes(avatarRef, photoFile)
        newAvatarUrl = await getDownloadURL(avatarRef)
      } catch (e) {
        toast.error('Ошибка загрузки аватара')
      }
    }

    // Сохраняем имя и аватар в Firestore
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          name,
          avatarUrl: newAvatarUrl,
        })
        setAvatarUrl(newAvatarUrl)
        setPhotoFile(null)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } catch (e) {
        toast.error('Ошибка сохранения профиля')
      }
    }
    setUploading(false)
  }

  // Клик по "вернуться в профиль"
  const handleBack = () => {
    setEdit(false)
    setPhotoFile(null)
    setPreview(null)
    setSuccess(false)
  }

  // Выводим плейсхолдер, если нет аватарки
  const avatar = preview
    || avatarUrl
    || '/avatar-placeholder.jpg'

  if (loading) {
    return <main className="p-8 text-white">Загрузка…</main>
  }

  // --- UI ---
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-[#18181B] rounded-2xl shadow-xl px-12 py-10 flex flex-col items-center max-w-lg w-full">
        {!edit ? (
          <>
            <div className="flex items-center gap-8">
              <img
                src={avatar}
                alt="avatar"
                className="w-36 h-36 rounded-full border-4 border-white object-cover"
                style={{ boxShadow: '0 0 0 4px #18181B' }}
              />
              <div>
                <h2 className="text-3xl font-bold">{name || 'Без имени'}</h2>
                <div className="mt-3 text-lg text-gray-300">
                  {favoritesCount !== null && (
                    <div>В избранном <b>{favoritesCount}</b> фильмов</div>
                  )}
                </div>
                <button
                  className="mt-6 px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 transition"
                  onClick={handleEdit}
                >
                  Изменить профиль
                </button>
              </div>
            </div>
          </>
        ) : (
          <form className="flex flex-col items-center w-full" onSubmit={handleSave}>
            <img
              src={preview || avatarUrl || '/posters/avatar-placeholder.jpg'}
              alt="avatar"
              className="w-36 h-36 rounded-full border-4 border-white object-cover mb-2"
              style={{ boxShadow: '0 0 0 4px #18181B' }}
            />
            <label
              htmlFor="avatar-upload"
              className="mt-2 mb-4 cursor-pointer text-pink-400 border-2 border-dashed border-pink-400 rounded-full p-6 hover:bg-pink-100/10 transition"
              style={{
                borderRadius: 100,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#ec4899',
              }}
            >
              Вставить фото
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoChange}
              />
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#222] text-white rounded px-4 py-2 mt-2 mb-4"
              placeholder="Имя"
              maxLength={32}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg font-semibold transition
                  ${success
                    ? 'bg-green-600 cursor-default'
                    : uploading
                      ? 'bg-gray-500 cursor-wait'
                      : 'bg-pink-600 hover:bg-pink-700'}`}
                disabled={uploading || success}
              >
                {success
                  ? 'Сохранено!'
                  : uploading
                    ? 'Сохраняем...'
                    : 'Сохранить'}
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition"
                onClick={handleBack}
              >
                Вернуться в профиль
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}