import { useState, useEffect } from 'react'

const STORAGE_KEY = 'stellar_voyage_state'

const DEMO_TRIPS = [
  {
    id: 'demo-kyoto',
    name: '京都楓葉古意五日遊',
    startDate: '2026-11-15',
    endDate: '2026-11-19',
    daysCount: 5,
    activities: [
      { id: 'act-1', dayIndex: 0, time: '08:30', title: '搭乘關西機場特急 Haruka 列車', category: 'flight', location: '關西國際機場 (KIX)', desc: '憑 JR Pass 兌換實體票，搭乘自由席前往京都車站，車程約 75 分鐘。' },
      { id: 'act-2', dayIndex: 0, time: '11:00', title: '京都車站宜必思尚品酒店 Check-in', category: 'hotel', location: '京都市南區東九條上殿田町47', desc: '寄存行李，順便在車站購買京都巴士一日券。' },
      { id: 'act-3', dayIndex: 0, time: '12:30', title: '拉麵小路午餐 - 本家第一旭', category: 'food', location: '京都車站伊勢丹百貨 10 樓', desc: '推薦醬油拉麵與特製叉燒，排隊大約需要 30 分鐘。' },
      { id: 'act-4', dayIndex: 0, time: '14:30', title: '清水寺與二年坂、三年坂散策', category: 'sightseeing', location: '京都市東山區清水1丁目294', desc: '拍攝秋季限定的清水舞台楓葉景緻。' },
      { id: 'act-5', dayIndex: 1, time: '09:00', title: '嵐山竹林小徑與渡月橋', category: 'sightseeing', location: '京都市右京區嵐山', desc: '清晨遊客較少，適合拍照。之後可去搭乘嵯峨野小火車賞楓。' },
      { id: 'act-6', dayIndex: 1, time: '13:00', title: '廣川鰻魚飯午餐', category: 'food', location: '京都市右京區嵯峨天龍寺北造路町44-1', desc: '嵐山超人氣米其林一星鰻魚飯，需要提前預約。' },
    ],
    photos: [],
  },
]

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return { trips: DEMO_TRIPS, activeTripId: 'demo-kyoto', activeDayIndex: 0, activeCategoryFilter: 'all' }
}

export function useTrips() {
  const [state, setState] = useState(loadInitialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const activeTrip = state.trips.find(t => t.id === state.activeTripId) || null

  function setActiveTripId(id) {
    setState(s => ({ ...s, activeTripId: id, activeDayIndex: 0 }))
  }

  function setActiveDayIndex(i) {
    setState(s => ({ ...s, activeDayIndex: i }))
  }

  function setFilter(f) {
    setState(s => ({ ...s, activeCategoryFilter: f }))
  }

  function addTrip({ name, startDate, endDate }) {
    const daysCount = calcDays(startDate, endDate)
    const newTrip = {
      id: 'trip-' + Date.now(),
      name,
      startDate: startDate || today(),
      endDate: endDate || offsetDate(startDate, 1),
      daysCount,
      activities: [],
      photos: [],
    }
    setState(s => ({ ...s, trips: [...s.trips, newTrip], activeTripId: newTrip.id, activeDayIndex: 0 }))
  }

  function deleteTrip(tripId) {
    setState(s => {
      const trips = s.trips.filter(t => t.id !== tripId)
      return { ...s, trips, activeTripId: trips[0]?.id ?? null, activeDayIndex: 0 }
    })
  }

  function addDay() {
    setState(s => ({
      ...s,
      trips: s.trips.map(t => {
        if (t.id !== s.activeTripId) return t
        const newEnd = new Date(t.endDate)
        newEnd.setDate(newEnd.getDate() + 1)
        return { ...t, daysCount: t.daysCount + 1, endDate: newEnd.toISOString().split('T')[0] }
      }),
    }))
  }

  function addActivity(act) {
    setState(s => ({
      ...s,
      trips: s.trips.map(t =>
        t.id !== s.activeTripId ? t
          : { ...t, activities: [...t.activities, { id: 'act-' + Date.now(), dayIndex: s.activeDayIndex, ...act }] }
      ),
    }))
  }

  function deleteActivity(actId) {
    setState(s => ({
      ...s,
      trips: s.trips.map(t =>
        t.id !== s.activeTripId ? t
          : { ...t, activities: t.activities.filter(a => a.id !== actId) }
      ),
    }))
  }

  function addPhoto(photoData) {
    setState(s => ({
      ...s,
      trips: s.trips.map(t =>
        t.id !== s.activeTripId ? t
          : { ...t, photos: [...t.photos, { id: 'photo-' + Date.now(), data: photoData, dayIndex: s.activeDayIndex, timestamp: new Date().toISOString() }] }
      ),
    }))
  }

  function deletePhoto(photoId) {
    setState(s => ({
      ...s,
      trips: s.trips.map(t =>
        t.id !== s.activeTripId ? t
          : { ...t, photos: t.photos.filter(p => p.id !== photoId) }
      ),
    }))
  }

  return {
    trips: state.trips,
    activeTrip,
    activeDayIndex: state.activeDayIndex,
    activeCategoryFilter: state.activeCategoryFilter,
    setActiveTripId,
    setActiveDayIndex,
    setFilter,
    addTrip,
    deleteTrip,
    addDay,
    addActivity,
    deleteActivity,
    addPhoto,
    deletePhoto,
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
