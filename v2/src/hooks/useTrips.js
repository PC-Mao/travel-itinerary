import { useState, useEffect } from 'react'
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export function useTrips(uid) {
  const [trips, setTrips] = useState([])
  const [activeTripId, setActiveTripIdState] = useState(null)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Real-time listener — auto-syncs across devices
  useEffect(() => {
    if (!uid) {
      setTrips([])
      setActiveTripIdState(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const ref = collection(db, 'users', uid, 'trips')
    const unsubscribe = onSnapshot(ref, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort by creation time
      data.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      setTrips(data)
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  const activeTrip = trips.find(t => t.id === activeTripId) ?? null

  function setActiveTripId(id) {
    setActiveTripIdState(id)
    setActiveDayIndex(0)
  }

  async function addTrip({ name, startDate, endDate }) {
    if (!uid) return
    const ref = collection(db, 'users', uid, 'trips')
    const docRef = await addDoc(ref, {
      name,
      startDate: startDate || today(),
      endDate: endDate || offsetDate(startDate, 1),
      daysCount: calcDays(startDate, endDate),
      activities: [],
      createdAt: serverTimestamp(),
    })
    setActiveTripId(docRef.id)
  }

  async function deleteTrip(tripId) {
    if (!uid) return
    await deleteDoc(doc(db, 'users', uid, 'trips', tripId))
    const remaining = trips.filter(t => t.id !== tripId)
    setActiveTripId(remaining[0]?.id ?? null)
  }

  async function toggleShare(tripId) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    await updateDoc(doc(db, 'users', uid, 'trips', tripId), {
      isShared: !trip.isShared,
    })
  }

  function getShareUrl(tripId) {
    const token = encodeURIComponent(btoa(`${uid}:${tripId}`))
    return `${window.location.origin}/travel-itinerary/v2/?share=${token}`
  }

  async function addDay() {
    if (!uid || !activeTrip) return
    const newEnd = new Date(activeTrip.endDate)
    newEnd.setDate(newEnd.getDate() + 1)
    await updateDoc(doc(db, 'users', uid, 'trips', activeTrip.id), {
      daysCount: activeTrip.daysCount + 1,
      endDate: newEnd.toISOString().split('T')[0],
    })
  }

  async function addActivity(act) {
    if (!uid || !activeTrip) return
    const newAct = { id: 'act-' + Date.now(), dayIndex: activeDayIndex, ...act }
    await updateDoc(doc(db, 'users', uid, 'trips', activeTrip.id), {
      activities: [...(activeTrip.activities ?? []), newAct],
    })
  }

  async function deleteActivity(actId) {
    if (!uid || !activeTrip) return
    await updateDoc(doc(db, 'users', uid, 'trips', activeTrip.id), {
      activities: (activeTrip.activities ?? []).filter(a => a.id !== actId),
    })
  }

  return {
    trips,
    activeTrip,
    activeDayIndex,
    activeCategoryFilter,
    loading,
    setActiveTripId,
    setActiveDayIndex,
    setFilter: setActiveCategoryFilter,
    addTrip,
    deleteTrip,
    addDay,
    addActivity,
    deleteActivity,
    toggleShare,
    getShareUrl,
  }
}

function calcDays(start, end) {
  if (!start || !end) return 1
  const diff = Math.abs(new Date(end) - new Date(start))
  const days = Math.ceil(diff / 86400000) + 1
  return isNaN(days) ? 1 : days
}

function today() { return new Date().toISOString().split('T')[0] }

function offsetDate(dateStr, days) {
  const d = dateStr ? new Date(dateStr) : new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
