'use client'
import { createContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, User 
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Пишем / обновляем профиль
        const userRef = doc(db, 'users', u.uid)
        await setDoc(userRef, {
          email: u.email,
          displayName: u.displayName || null,
          lastLogin: Date.now(),
          favorites: [] as string[],
        }, { merge: true })
      }
      setUser(u)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}