import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db, USERS_COL } from '../firebase'

function decodeShare(shareParam) {
  try {
    const decoded = atob(decodeURIComponent(shareParam))
    const colonIdx = decoded.indexOf(':')
    if (colonIdx === -1) return null
    return { ownerUid: decoded.slice(0, colonIdx), tripId: decoded.slice(colonIdx + 1) }
  } catch { return null }
}

export function useSharedTrip(shareParam) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')

  const parsed = useMemo(() => shareParam ? decodeShare(shareParam) : null, [shareParam])

  useEffect(() => {
    if (!parsed) { setError('分享連結格式無效。'); return }
    setLoading(true)
    const ref = doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId)
    const unsubscribe = onSnapshot(ref,
      snap => {
        if (snap.exists() && snap.data().isShared) {
          setTrip({ id: snap.id, ...snap.data() }); setError(null)
        } else {
          setTrip(null); setError('此分享連結無效，或旅程擁有者已關閉分享。')
        }
        setLoading(false)
      },
      () => { setError('無法載入分享旅程。'); setLoading(false) }
    )
    return unsubscribe
  }, [parsed?.ownerUid, parsed?.tripId])

  async function addActivity(act) {
    if (!trip || !parsed) return
    const newAct = { id: 'act-' + Date.now(), dayIndex: activeDayIndex, ...act }
    await updateDoc(doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId), {
      activities: [...(trip.activities ?? []), newAct],
    })
  }

  async function updateActivity(actId, updates) {
    if (!trip || !parsed) return
    await updateDoc(doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId), {
      activities: (trip.activities ?? []).map(a => a.id === actId ? { ...a, ...updates } : a),
    })
  }

  async function deleteActivity(actId) {
    if (!trip || !parsed) return
    await updateDoc(doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId), {
      activities: (trip.activities ?? []).filter(a => a.id !== actId),
    })
  }

  async function updateDayMemo(dayIndex, memo) {
    if (!trip || !parsed) return
    const dayMemos = [...(trip.dayMemos || [])]
    dayMemos[dayIndex] = memo
    await updateDoc(doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId), { dayMemos })
  }

  async function addDay() {
    if (!trip || !parsed) return
    const newEnd = new Date(trip.endDate)
    newEnd.setDate(newEnd.getDate() + 1)
    await updateDoc(doc(db, USERS_COL, parsed.ownerUid, 'trips', parsed.tripId), {
      daysCount: trip.daysCount + 1,
      endDate: newEnd.toISOString().split('T')[0],
    })
  }

  return {
    trip, loading, error,
    ownerUid: parsed?.ownerUid ?? null,
    activeDayIndex, setActiveDayIndex,
    activeCategoryFilter, setFilter: setActiveCategoryFilter,
    addActivity, updateActivity, deleteActivity, addDay, updateDayMemo,
  }
}
