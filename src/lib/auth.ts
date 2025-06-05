import {
  initializeApp,
  getApps,
  getApp,
} from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth'

// Добавляем импорт Firestore
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCASI1Ef7-szK985QkpgvJlP1VOmpf5edA",        
  authDomain: "kinodasha-74077.firebaseapp.com",
  projectId: "kinodasha-74077",
  storageBucket: "kinodasha-74077.firebasestorage.app",
  messagingSenderId: "29053875210",
  appId: "1:29053875210:web:460261b1c90b2e01119bf3"
} 

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

// Инициализируем Firestore
const db = getFirestore(app)

const googleProvider = new GoogleAuthProvider()

/** Вход через Google-попап */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const u      = result.user

  // сразу пишем или обновляем профиль в users/{uid}
  await setDoc(
    doc(db, 'users', u.uid),
    {
      email: u.email,
      displayName: u.displayName || null,
      lastLogin: Date.now(),
      // новое поле favorites
      favorites: [] as string[],
    },
    { merge: true }
  )

  return u
}

/** Вход по e-mail и паролю */
export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

/** Регистрация по e-mail и паролю */
export async function registerWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const u          = credential.user

  // аналогично: сохраняем профиль сразу после регистрации
  await setDoc(
    doc(db, 'users', u.uid),
    {
      email: u.email,
      displayName: u.displayName || null,
      lastLogin: Date.now(),
      favorites: [] as string[],
    },
    { merge: true }
  )

  return u
}

/** Выход */
export function logout() {
  return signOut(auth)
}