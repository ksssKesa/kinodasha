'use client';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginButton() {
  const user = auth.currentUser;

  async function handleClick() {
    if (user) {
      await signOut(auth);
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  }

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-emerald-600 text-white rounded">
      {user ? 'Sign out' : 'Sign in with Google'}
    </button>
  );
}