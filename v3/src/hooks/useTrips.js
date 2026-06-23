import { useState, useEffect } from 'react'
import {
  collection, doc, onSnapshot,
  addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db, USERS_COL } from '../firebase'

export function useTrips(uid) {
  const [trips, setTrips] = useState([])
  const [activeTripId, setActiveTripIdState] = useState(null)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setTrips([]); setActiveTripIdState(null); setLoading(false); return }
    setLoading(true)
    const ref = collection(db, USERS_COL, uid, 'trips')
    const unsubscribe = onSnapshot(ref, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      setTrips(data)
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  const activeTrip = trips.find(t => t.id === activeTripId) ?? null

  function setActiveTripId(id) { setActiveTripIdState(id); setActiveDayIndex(0) }

  async function addTrip({ name, startDate, endDate }) {
    if (!uid) return
    const ref = collection(db, USERS_COL, uid, 'trips')
    const docRef = await addDoc(ref, {
      name,
      startDate: startDate || today(),
      endDate: endDate || offsetDate(startDate, 1),
      daysCount: calcDays(startDate, endDate),
      activities: [],
      members: [],
      isShared: false,
      createdAt: serverTimestamp(),
    })
    setActiveTripId(docRef.id)
  }

  async function deleteTrip(tripId) {
    if (!uid) return
    await deleteDoc(doc(db, USERS_COL, uid, 'trips', tripId))
    const remaining = trips.filter(t => t.id !== tripId)
    setActiveTripId(remaining[0]?.id ?? null)
  }

  async function addDay() {
    if (!uid || !activeTrip) return
    const newEnd = new Date(activeTrip.endDate)
    newEnd.setDate(newEnd.getDate() + 1)
    await updateDoc(doc(db, USERS_COL, uid, 'trips', activeTrip.id), {
      daysCount: activeTrip.daysCount + 1,
      endDate: newEnd.toISOString().split('T')[0],
    })
  }

  async function updateTrip(tripId, { name, startDate, endDate }) {
    if (!uid) return
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), {
      name, startDate, endDate,
      daysCount: calcDays(startDate, endDate),
    })
  }

  async function removeDay(tripId, dayIndex) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip || trip.daysCount <= 1) return
    const newActivities = trip.activities
      .filter(a => a.dayIndex !== dayIndex)
      .map(a => a.dayIndex > dayIndex ? { ...a, dayIndex: a.dayIndex - 1 } : a)
    const newMemos = [...(trip.dayMemos || [])]
    newMemos.splice(dayIndex, 1)
    const newEnd = new Date(trip.endDate)
    newEnd.setDate(newEnd.getDate() - 1)
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), {
      daysCount: trip.daysCount - 1,
      endDate: newEnd.toISOString().split('T')[0],
      activities: newActivities,
      dayMemos: newMemos,
    })
    if (activeDayIndex >= trip.daysCount - 1) setActiveDayIndex(Math.max(0, trip.daysCount - 2))
  }

  async function addActivity(act) {
    if (!uid || !activeTrip) return
    const newAct = { id: 'act-' + Date.now(), dayIndex: activeDayIndex, ...act }
    await updateDoc(doc(db, USERS_COL, uid, 'trips', activeTrip.id), {
      activities: [...(activeTrip.activities ?? []), newAct],
    })
  }

  async function updateActivity(actId, updates) {
    if (!uid || !activeTrip) return
    await updateDoc(doc(db, USERS_COL, uid, 'trips', activeTrip.id), {
      activities: (activeTrip.activities ?? []).map(a => a.id === actId ? { ...a, ...updates } : a),
    })
  }

  async function deleteActivity(actId) {
    if (!uid || !activeTrip) return
    await updateDoc(doc(db, USERS_COL, uid, 'trips', activeTrip.id), {
      activities: (activeTrip.activities ?? []).filter(a => a.id !== actId),
    })
  }

  async function updateDayMemo(tripId, dayIndex, memo) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    const dayMemos = [...(trip.dayMemos || [])]
    dayMemos[dayIndex] = memo
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), { dayMemos })
  }

  async function addMember(tripId, name) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    const newMember = { id: 'mem-' + Date.now(), name }
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), {
      members: [...(trip.members ?? []), newMember],
    })
  }

  async function deleteMember(tripId, memberId) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), {
      members: (trip.members ?? []).filter(m => m.id !== memberId),
    })
  }

  async function toggleShare(tripId) {
    if (!uid) return
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    await updateDoc(doc(db, USERS_COL, uid, 'trips', tripId), { isShared: !trip.isShared })
  }

  function getShareUrl(tripId) {
    const token = encodeURIComponent(btoa(`${uid}:${tripId}`))
    return `${window.location.origin}/travel-itinerary/v3/?share=${token}`
  }

  return {
    trips, activeTrip, activeDayIndex, activeCategoryFilter, loading,
    setActiveTripId, setActiveDayIndex,
    setFilter: setActiveCategoryFilter,
    addTrip, updateTrip, deleteTrip, addDay, removeDay,
    addActivity, updateActivity, deleteActivity,
    updateDayMemo,
    addMember, deleteMember,
    toggleShare, getShareUrl,
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
