import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle redirect result after returning from Google login
    getRedirectResult(auth).catch(err => {
      console.error('Redirect result error', err)
    })

    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  function signIn() {
    signInWithRedirect(auth, provider)
  }

  async function logOut() {
    await signOut(auth)
  }

  return { user, loading, signIn, logOut }
}
