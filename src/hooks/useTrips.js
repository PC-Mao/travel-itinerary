import { useState, useEffect } from 'react'

const STORAGE_KEY = 'travel_itinerary_trips'

function loadTrips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export function useTrips() {
  const [trips, setTrips] = useState(loadTrips)

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  function addTrip({ name, startDate, endDate }) {
    const trip = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
      days: buildDays(startDate, endDate),
    }
    setTrips(prev => [...prev, trip])
    return trip.id
  }

  function updateTrip(tripId, updates) {
    setTrips(prev =>
      prev.map(t =>
        t.id === tripId
          ? { ...t, ...updates, days: updates.startDate ? buildDays(updates.startDate, updates.endDate ?? t.endDate) : t.days }
          : t
      )
    )
  }

  function deleteTrip(tripId) {
    setTrips(prev => prev.filter(t => t.id !== tripId))
  }

  function addPlace(tripId, dayIndex, place) {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t
        const days = t.days.map((d, i) => {
          if (i !== dayIndex) return d
          return { ...d, places: [...d.places, { id: crypto.randomUUID(), ...place }] }
        })
        return { ...t, days }
      })
    )
  }

  function updatePlace(tripId, dayIndex, placeId, updates) {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t
        const days = t.days.map((d, i) => {
          if (i !== dayIndex) return d
          return { ...d, places: d.places.map(p => p.id === placeId ? { ...p, ...updates } : p) }
        })
        return { ...t, days }
      })
    )
  }

  function deletePlace(tripId, dayIndex, placeId) {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t
        const days = t.days.map((d, i) => {
          if (i !== dayIndex) return d
          return { ...d, places: d.places.filter(p => p.id !== placeId) }
        })
        return { ...t, days }
      })
    )
  }

  function reorderPlaces(tripId, dayIndex, orderedIds) {
    setTrips(prev =>
      prev.map(t => {
        if (t.id !== tripId) return t
        const days = t.days.map((d, i) => {
          if (i !== dayIndex) return d
          const sorted = orderedIds.map(id => d.places.find(p => p.id === id)).filter(Boolean)
          return { ...d, places: sorted }
        })
        return { ...t, days }
      })
    )
  }

  function exportJSON(tripId) {
    const trip = trips.find(t => t.id === tripId)
    if (!trip) return
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const trip = JSON.parse(e.target.result)
          trip.id = crypto.randomUUID()
          setTrips(prev => [...prev, trip])
          resolve()
        } catch {
          reject(new Error('無效的 JSON 格式'))
        }
      }
      reader.readAsText(file)
    })
  }

  return { trips, addTrip, updateTrip, deleteTrip, addPlace, updatePlace, deletePlace, reorderPlaces, exportJSON, importJSON }
}

// Generate one entry per day between startDate and endDate
function buildDays(startDate, endDate) {
  const days = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({ date: d.toISOString().slice(0, 10), places: [] })
  }
  return days
}
