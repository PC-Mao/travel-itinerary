import { useState } from 'react'
import { useTrips } from './hooks/useTrips'
import TripList from './components/TripList'
import TripDetail from './components/TripDetail'

export default function App() {
  const { trips, addTrip, deleteTrip, addPlace, updatePlace, deletePlace, reorderPlaces, exportJSON, importJSON } = useTrips()
  const [selectedTripId, setSelectedTripId] = useState(null)

  const selectedTrip = trips.find(t => t.id === selectedTripId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <span className="text-xl">✈️</span>
        <h1 className="text-lg font-bold text-gray-700 cursor-pointer" onClick={() => setSelectedTripId(null)}>
          Travel Itinerary
        </h1>
      </header>

      <main>
        {selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            onBack={() => setSelectedTripId(null)}
            onAddPlace={addPlace}
            onUpdatePlace={updatePlace}
            onDeletePlace={deletePlace}
            onReorder={reorderPlaces}
            onExport={exportJSON}
          />
        ) : (
          <TripList
            trips={trips}
            onSelect={setSelectedTripId}
            onAdd={addTrip}
            onDelete={deleteTrip}
            onImport={importJSON}
          />
        )}
      </main>
    </div>
  )
}
