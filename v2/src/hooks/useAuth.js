import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Keep loading=true until BOTH checks resolve:
    // 1. getRedirectResult — processes the token after returning from Google
    // 2. onAuthStateChanged — reads the persisted auth state
    let redirectDone = false
    let authStateDone = false

    function tryFinish() {
      if (redirectDone && authStateDone) setLoading(false)
    }

    getRedirectResult(auth)
      .then(result => {
        if (result?.user) setUser(result.user)
      })
      .catch(err => console.error('getRedirectResult error:', err.code, err.message))
      .finally(() => { redirectDone = true; tryFinish() })

    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      authStateDone = true
      tryFinish()
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
