import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signIn() {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('登入失敗', err)
    }
  }

  async function logOut() {
    await signOut(auth)
  }

  return { user, loading, signIn, logOut }
}
