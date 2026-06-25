import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
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

    // Handle the redirect fallback result (if popup was unavailable)
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

  async function signIn() {
    setError(null)
    try {
      // Popup returns the credential via postMessage within the same JS
      // context, avoiding the cross-domain storage access that
      // signInWithRedirect needs (blocked by mobile privacy browsers like
      // Safari ITP / Brave shields when authDomain != app domain).
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('signInWithPopup:', err.code)
      // User deliberately closed the popup — do nothing.
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/user-cancelled') {
        return
      }
      // Popup blocked or unsupported — fall back to full-page redirect.
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, provider)
        } catch (e) {
          console.error('signInWithRedirect fallback:', e.code)
          setError('登入失敗，請再試一次，或關閉瀏覽器的隱私防護後重試。')
        }
        return
      }
      setError('登入失敗：' + (err.code || '未知錯誤'))
    }
  }

  async function logOut() {
    await signOut(auth)
  }

  return { user, loading, error, signIn, logOut }
}
