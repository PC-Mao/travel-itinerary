import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signIn() {
    setError(null)
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('signIn error:', err.code, err.message)
      const messages = {
        'auth/popup-blocked': '瀏覽器封鎖了登入視窗，請允許此網站顯示彈出視窗後再試。',
        'auth/popup-closed-by-user': '登入視窗已關閉，請重新點擊登入。',
        'auth/unauthorized-domain': '此網域尚未授權，請確認 Firebase Console 已加入此網域。',
        'auth/cancelled-popup-request': null,
      }
      const msg = messages[err.code]
      if (msg) setError(msg)
    }
  }

  async function logOut() {
    await signOut(auth)
  }

  return { user, loading, error, signIn, logOut }
}
