import { useState } from 'react'
import { useTrips } from './hooks/useTrips'
import Sidebar from './components/Sidebar'
import Timeline from './components/Timeline'
import GalleryPanel from './components/GalleryPanel'
import TripModal from './components/modals/TripModal'
import ActivityModal from './components/modals/ActivityModal'
import Lightbox from './components/modals/Lightbox'

export default function App() {
  const {
    trips, activeTrip, activeDayIndex, activeCategoryFilter,
    setActiveTripId, setActiveDayIndex, setFilter,
    addTrip, deleteTrip, addDay,
    addActivity, deleteActivity,
    addPhoto, deletePhoto,
  } = useTrips()

  const [showTripModal, setShowTripModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  function formatDateRange(start, end) {
    if (!start) return '請先建立或選擇一個旅程'
    if (!end || start === end) return start
    return `${start} 至 ${end}`
  }

  return (
    <div className="app-container">
      <Sidebar
        trips={trips}
        activeTrip={activeTrip}
        activeDayIndex={activeDayIndex}
        onSelectTrip={setActiveTripId}
        onNewTrip={() => setShowTripModal(true)}
        onSelectDay={setActiveDayIndex}
        onAddDay={addDay}
      />

      <main className="main-content">
        <header className="top-nav">
          <div className="trip-title-area">
            <h1>{activeTrip ? activeTrip.name : '尚未選擇旅程'}</h1>
            <span className="trip-dates">
              {activeTrip ? formatDateRange(activeTrip.startDate, activeTrip.endDate) : '請先建立或選擇一個旅程'}
            </span>
          </div>
          {activeTrip && (
            <div className="header-actions">
              <button className="btn btn-danger"
                onClick={() => {
                  if (confirm(`確定要刪除整個旅程「${activeTrip.name}」與所有相關行程、相簿嗎？`))
                    deleteTrip(activeTrip.id)
                }}
              >
                <i className="fa-solid fa-trash" /> 刪除此旅程
              </button>
            </div>
          )}
        </header>

        <div className="dashboard-grid">
          <Timeline
            activeTrip={activeTrip}
            activeDayIndex={activeDayIndex}
            activeFilter={activeCategoryFilter}
            onFilter={setFilter}
            onAddActivity={() => setShowActivityModal(true)}
            onDeleteActivity={deleteActivity}
          />
          <GalleryPanel
            activeTrip={activeTrip}
            activeDayIndex={activeDayIndex}
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
            onOpenLightbox={setLightboxPhoto}
          />
        </div>
      </main>

      {showTripModal && (
        <TripModal
          onClose={() => setShowTripModal(false)}
          onSubmit={form => { addTrip(form); setShowTripModal(false) }}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          onClose={() => setShowActivityModal(false)}
          onSubmit={act => { addActivity(act); setShowActivityModal(false) }}
        />
      )}

      <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  )
}
