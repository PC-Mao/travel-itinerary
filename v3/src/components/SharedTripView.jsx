import { useState, useEffect } from 'react'
import Timeline from './Timeline'
import DetailsPanel from './DetailsPanel'
import ActivityModal from './modals/ActivityModal'
import Lightbox from './modals/Lightbox'

export default function SharedTripView({
  trip, ownerUid, activeDayIndex, setActiveDayIndex,
  activeCategoryFilter, setFilter,
  addActivity, updateActivity, deleteActivity, addDay, updateDayMemo,
  user, onSignIn,
}) {
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [actToEdit, setActToEdit] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  // Mobile tab state (timeline | details)
  const [mobileTab, setMobileTab] = useState('timeline')
  useEffect(() => { window.scrollTo(0, 0) }, [mobileTab])

  // Photos & expenses stored locally, keyed by ownerUid so all viewers of the
  // same share link use a consistent key on their own device.
  const photoStoreKey = 'sv_v3_photos'
  const expenseStoreKey = 'sv_v3_expenses'
  const [localPhotos, setLocalPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(photoStoreKey) || '{}') } catch { return {} }
  })
  const [localExpenses, setLocalExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(expenseStoreKey) || '{}') } catch { return {} }
  })

  function photoKey(actId) { return `${ownerUid}_${actId}` }
  function dayKey(dayIdx) { return `${ownerUid}_${trip.id}_${dayIdx}` }

  function addPhoto(data) {
    if (!selectedActivity) return
    const k = photoKey(selectedActivity.id)
    const updated = { ...localPhotos, [k]: [...(localPhotos[k] || []), { id: 'p-' + Date.now(), data, label: selectedActivity.title }] }
    setLocalPhotos(updated)
    localStorage.setItem(photoStoreKey, JSON.stringify(updated))
  }
  function deletePhoto(photoId) {
    if (!selectedActivity) return
    const k = photoKey(selectedActivity.id)
    const updated = { ...localPhotos, [k]: (localPhotos[k] || []).filter(p => p.id !== photoId) }
    setLocalPhotos(updated)
    localStorage.setItem(photoStoreKey, JSON.stringify(updated))
  }
  function addExpense({ purpose, amount, payerId, sharedMemberIds }) {
    const k = dayKey(activeDayIndex)
    const now = new Date()
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const updated = { ...localExpenses, [k]: [...(localExpenses[k] || []), { id: 'ex-' + Date.now(), purpose, amount, payerId, sharedMemberIds, time: timeStr }] }
    setLocalExpenses(updated)
    localStorage.setItem(expenseStoreKey, JSON.stringify(updated))
  }
  function deleteExpense(expId) {
    const k = dayKey(activeDayIndex)
    const updated = { ...localExpenses, [k]: (localExpenses[k] || []).filter(e => e.id !== expId) }
    setLocalExpenses(updated)
    localStorage.setItem(expenseStoreKey, JSON.stringify(updated))
  }

  const currentPhotos = selectedActivity ? (localPhotos[photoKey(selectedActivity.id)] || []) : []
  // Day-level expenses
  const currentExpenses = localExpenses[dayKey(activeDayIndex)] || []

  return (
    <div className="app-container" style={{ display: 'block' }}>
      {/* Share banner */}
      <div style={{ background: 'hsla(180, 100%, 48%, 0.08)', borderBottom: '1px solid var(--border-color)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
          <i className="fa-solid fa-share-nodes" style={{ marginRight: '8px' }} />
          您正在編輯分享的行程：<strong style={{ marginLeft: '4px' }}>{trip.name}</strong>
        </span>
        {!user && (
          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onSignIn}>
            <i className="fa-brands fa-google" /> 登入以建立自己的旅程
          </button>
        )}
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Trip header */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {trip.name}
          </h1>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
            {trip.startDate} 至 {trip.endDate}　·　共 {trip.daysCount} 天
          </span>
        </div>

        {/* Day chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
          {Array.from({ length: trip.daysCount }, (_, i) => (
            <button key={i}
              className={`day-chip ${i === activeDayIndex ? 'active' : ''}`}
              onClick={() => { setSelectedActivity(null); setActiveDayIndex(i) }}
            >
              <i className="fa-solid fa-calendar-day" /> Day {i + 1}
            </button>
          ))}
          <button className="btn-icon" title="新增天數" onClick={addDay}>
            <i className="fa-solid fa-calendar-plus" />
          </button>
        </div>

        {/* Two-column dashboard (responsive; mobile tab-controlled) */}
        <div className="dashboard-grid">
          <Timeline
            className={mobileTab !== 'timeline' ? 'panel-hidden-mobile' : ''}
            activeTrip={trip}
            activeDayIndex={activeDayIndex}
            activeFilter={activeCategoryFilter}
            onFilter={setFilter}
            onAddActivity={() => { setActToEdit(null); setShowActivityModal(true) }}
            onEditActivity={act => { setActToEdit(act); setShowActivityModal(true) }}
            onDeleteActivity={id => { if (selectedActivity?.id === id) setSelectedActivity(null); deleteActivity(id) }}
            selectedActivityId={selectedActivity?.id}
            onSelectActivity={act => { setSelectedActivity(act); setMobileTab('details') }}
          />
          <DetailsPanel
            className={mobileTab !== 'details' ? 'panel-hidden-mobile' : ''}
            selectedActivity={selectedActivity}
            photos={currentPhotos}
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
            onOpenLightbox={setLightboxPhoto}
            expenses={currentExpenses}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            activeTrip={trip}
            activeDayIndex={activeDayIndex}
            onUpdateDayMemo={memo => updateDayMemo(activeDayIndex, memo)}
          />
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tab-bar">
        <button
          className={`mobile-tab-btn ${mobileTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setMobileTab('timeline')}
        >
          <i className="fa-solid fa-list-check" />
          <span>時間軸</span>
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'details' ? 'active' : ''}`}
          onClick={() => setMobileTab('details')}
        >
          <i className="fa-solid fa-wallet" />
          <span>詳情</span>
        </button>
      </nav>

      {showActivityModal && (
        <ActivityModal
          actToEdit={actToEdit}
          onClose={() => { setShowActivityModal(false); setActToEdit(null) }}
          onSubmit={form => {
            if (actToEdit) updateActivity(actToEdit.id, form)
            else addActivity(form)
            setShowActivityModal(false); setActToEdit(null)
          }}
        />
      )}
      <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  )
}
