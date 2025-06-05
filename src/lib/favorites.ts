import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// userId — текущий user.uid, isFav — есть ли уже в избранном
export async function toggleFavorite(userId: string, movieId: string, isFav: boolean) {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    favorites: isFav 
      ? arrayRemove(movieId) 
      : arrayUnion(movieId)
  })
}