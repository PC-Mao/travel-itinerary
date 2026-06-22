import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let redirectDone = false
    let authStateDone = false

    function tryFinish() {
      if (redirectDone && authStateDone) setLoading(false)
    }

    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user) })
      .catch(err => console.error('getRedirectResult:', err.code))
      .finally(() => { redirectDone = true; tryFinish() })

    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      authStateDone = true
      tryFinish()
    })

    return unsubscribe
  }, [])

  function signIn() {
    setError(null)
    signInWithRedirect(auth, provider)
  }

  async function logOut() {
    await signOut(auth)
  }

  return { user, loading, error, signIn, logOut }
}
