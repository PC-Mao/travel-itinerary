import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrips } from './hooks/useTrips'
import Sidebar from './components/Sidebar'
import Timeline from './components/Timeline'
import GalleryPanel from './components/GalleryPanel'
import TripModal from './components/modals/TripModal'
import ActivityModal from './components/modals/ActivityModal'
import Lightbox from './components/modals/Lightbox'

export default function App() {
  const { user, loading: authLoading, signIn, logOut } = useAuth()
  const {
    trips, activeTrip, activeDayIndex, activeCategoryFilter, loading: tripsLoading,
    setActiveTripId, setActiveDayIndex, setFilter,
    addTrip, deleteTrip, addDay, addActivity, deleteActivity,
  } = useTrips(user?.uid)

  const [showTripModal, setShowTripModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  // Photos stay in localStorage (no Firebase Storage)
  const [localPhotos, setLocalPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_photos') || '{}') } catch { return {} }
  })

  function savePhotos(photos) {
    setLocalPhotos(photos)
    localStorage.setItem('sv_photos', JSON.stringify(photos))
  }

  function tripPhotoKey() { return `${user?.uid}_${activeTrip?.id}_${activeDayIndex}` }

  function addPhoto(data) {
    const key = tripPhotoKey()
    const updated = { ...localPhotos, [key]: [...(localPhotos[key] || []), { id: 'p-' + Date.now(), data, dayIndex: activeDayIndex }] }
    savePhotos(updated)
  }

  function deletePhoto(photoId) {
    const key = tripPhotoKey()
    const updated = { ...localPhotos, [key]: (localPhotos[key] || []).filter(p => p.id !== photoId) }
    savePhotos(updated)
  }

  const currentPhotos = activeTrip ? (localPhotos[tripPhotoKey()] || []) : []

  function formatDateRange(start, end) {
    if (!start) return '請先建立或選擇一個旅程'
    if (!end || start === end) return start
    return `${start} 至 ${end}`
  }

  // Loading screen
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <i className="fa-solid fa-compass-drafting" style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }} />
        <p style={{ color: 'var(--text-muted)' }}>載入中…</p>
      </div>
    )
  }

  // Login screen
  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backdropFilter: 'blur(16px)', maxWidth: '380px', width: '90%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
            <i className="fa-solid fa-compass-drafting" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StellarVoyage
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
            登入後，您的旅行行程將雲端同步<br />任何裝置都能查看與編輯
          </p>
          <button onClick={signIn} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '12px', padding: '14px' }}>
            <i className="fa-brands fa-google" />
            以 Google 帳號登入
          </button>
        </div>
      </div>
    )
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
        user={user}
        onLogOut={logOut}
      />

      <main className="main-content">
        <header className="top-nav">
          <div className="trip-title-area">
            <h1>{activeTrip ? activeTrip.name : '尚未選擇旅程'}</h1>
            <span className="trip-dates">
              {activeTrip
                ? formatDateRange(activeTrip.startDate, activeTrip.endDate)
                : tripsLoading ? '資料載入中…' : '請點擊左側「+」新增旅程'}
            </span>
          </div>
          {activeTrip && (
            <div className="header-actions">
              <button className="btn btn-danger"
                onClick={() => {
                  if (confirm(`確定要刪除整個旅程「${activeTrip.name}」與所有相關行程嗎？`))
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
            activeTrip={activeTrip ? { ...activeTrip, photos: currentPhotos } : null}
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
