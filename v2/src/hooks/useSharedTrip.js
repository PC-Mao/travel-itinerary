import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Decode share token (base64 of "uid:tripId") and listen to that trip in real-time
export function useSharedTrip(shareParam) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shareParam) return

    setLoading(true)
    let unsubscribe = () => {}

    try {
      const decoded = atob(decodeURIComponent(shareParam))
      const colonIdx = decoded.indexOf(':')
      if (colonIdx === -1) throw new Error('invalid format')

      const uid = decoded.slice(0, colonIdx)
      const tripId = decoded.slice(colonIdx + 1)

      const ref = doc(db, 'users', uid, 'trips', tripId)
      unsubscribe = onSnapshot(
        ref,
        snap => {
          if (snap.exists() && snap.data().isShared) {
            setTrip({ id: snap.id, ...snap.data() })
            setError(null)
          } else {
            setTrip(null)
            setError('此分享連結無效，或旅程擁有者已關閉分享。')
          }
          setLoading(false)
        },
        () => {
          setError('無法載入分享旅程，請確認連結是否正確。')
          setLoading(false)
        }
      )
    } catch {
      setError('分享連結格式無效。')
      setLoading(false)
    }

    return unsubscribe
  }, [shareParam])

  return { trip, loading, error }
}
