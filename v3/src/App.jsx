import { useState, useRef, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrips } from './hooks/useTrips'
import { useSharedTrip } from './hooks/useSharedTrip'
import Sidebar from './components/Sidebar'
import Timeline from './components/Timeline'
import DetailsPanel from './components/DetailsPanel'
import SharedTripView from './components/SharedTripView'
import TripModal from './components/modals/TripModal'
import ActivityModal from './components/modals/ActivityModal'
import MembersModal from './components/modals/MembersModal'
import Lightbox from './components/modals/Lightbox'

const shareParam = new URLSearchParams(window.location.search).get('share')

export default function App() {
  const { user, loading: authLoading, signIn, logOut } = useAuth()
  const {
    trips, activeTrip, activeDayIndex, activeCategoryFilter, loading: tripsLoading,
    setActiveTripId, setActiveDayIndex, setFilter,
    addTrip, updateTrip, deleteTrip, addDay, removeDay,
    addActivity, updateActivity, deleteActivity,
    updateDayMemo,
    addMember, deleteMember,
    toggleShare, getShareUrl,
  } = useTrips(user?.uid)

  const {
    trip: sharedTrip, loading: sharedLoading, error: sharedError, ownerUid: sharedOwnerUid,
    activeDayIndex: sharedDayIndex, setActiveDayIndex: setSharedDayIndex,
    activeCategoryFilter: sharedFilter, setFilter: setSharedFilter,
    addActivity: sharedAddActivity, updateActivity: sharedUpdateActivity,
    deleteActivity: sharedDeleteActivity, addDay: sharedAddDay, updateDayMemo: sharedUpdateDayMemo,
  } = useSharedTrip(shareParam || null)

  const [showTripModal, setShowTripModal] = useState(false)
  const [tripToEdit, setTripToEdit] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [actToEdit, setActToEdit] = useState(null)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)

  // Mobile navigation state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState('timeline') // 'timeline' | 'details'
  const mainContentRef = useRef(null)

  // Scroll to top of main-content whenever the mobile tab changes
  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0
  }, [mobileTab])

  const [localPhotos, setLocalPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_v3_photos') || '{}') } catch { return {} }
  })

  function photoKey(actId) { return `${user?.uid}_${actId}` }

  function addPhoto(data) {
    if (!selectedActivity) return
    const key = photoKey(selectedActivity.id)
    const updated = { ...localPhotos, [key]: [...(localPhotos[key] || []), { id: 'p-' + Date.now(), data, label: selectedActivity.title }] }
    setLocalPhotos(updated)
    localStorage.setItem('sv_v3_photos', JSON.stringify(updated))
  }

  function deletePhoto(photoId) {
    if (!selectedActivity) return
    const key = photoKey(selectedActivity.id)
    const updated = { ...localPhotos, [key]: (localPhotos[key] || []).filter(p => p.id !== photoId) }
    setLocalPhotos(updated)
    localStorage.setItem('sv_v3_photos', JSON.stringify(updated))
  }

  const currentPhotos = selectedActivity ? (localPhotos[photoKey(selectedActivity.id)] || []) : []

  // Expenses (localStorage, keyed by uid_activityId)
  const [localExpenses, setLocalExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_v3_expenses') || '{}') } catch { return {} }
  })
  function expKey(actId) { return `${user?.uid}_${actId}` }
  function addExpense({ purpose, amount }) {
    if (!selectedActivity) return
    const key = expKey(selectedActivity.id)
    const now = new Date()
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const updated = { ...localExpenses, [key]: [...(localExpenses[key] || []), { id: 'ex-' + Date.now(), purpose, amount, time: timeStr }] }
    setLocalExpenses(updated)
    localStorage.setItem('sv_v3_expenses', JSON.stringify(updated))
  }
  function deleteExpense(expId) {
    if (!selectedActivity) return
    const key = expKey(selectedActivity.id)
    const updated = { ...localExpenses, [key]: (localExpenses[key] || []).filter(e => e.id !== expId) }
    setLocalExpenses(updated)
    localStorage.setItem('sv_v3_expenses', JSON.stringify(updated))
  }
  const currentExpenses = selectedActivity ? (localExpenses[expKey(selectedActivity.id)] || []) : []

  function handleSetActiveTripId(id) { setSelectedActivity(null); setActiveTripId(id) }
  function handleSetActiveDayIndex(i) { setSelectedActivity(null); setActiveDayIndex(i) }

  async function handleShare(tripId) {
    const trip = trips.find(t => t.id === tripId)
    await toggleShare(tripId)
    if (!trip?.isShared) {
      const url = getShareUrl(tripId)
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 3000)
      })
    }
  }

  function formatDateRange(start, end) {
    if (!start) return ''
    return end && start !== end ? `${start} 至 ${end}` : start
  }

  // Loading
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <i className="fa-solid fa-compass-drafting" style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }} />
        <p style={{ color: 'var(--text-muted)' }}>載入中…</p>
      </div>
    )
  }

  // Shared trip view
  if (shareParam) {
    if (sharedLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
          <i className="fa-solid fa-compass-drafting" style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }} />
          <p style={{ color: 'var(--text-muted)' }}>載入分享行程中…</p>
        </div>
      )
    }
    if (sharedError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
          <i className="fa-solid fa-link-slash" style={{ fontSize: '3rem', color: 'var(--danger)' }} />
          <p style={{ color: 'var(--text-muted)' }}>{sharedError}</p>
          <button className="btn btn-primary" onClick={signIn}><i className="fa-brands fa-google" /> 登入</button>
        </div>
      )
    }
    if (sharedTrip) {
      return (
        <SharedTripView
          trip={sharedTrip}
          ownerUid={sharedOwnerUid}
          activeDayIndex={sharedDayIndex}
          setActiveDayIndex={setSharedDayIndex}
          activeCategoryFilter={sharedFilter}
          setFilter={setSharedFilter}
          addActivity={sharedAddActivity}
          updateActivity={sharedUpdateActivity}
          deleteActivity={sharedDeleteActivity}
          addDay={sharedAddDay}
          updateDayMemo={sharedUpdateDayMemo}
          user={user}
          onSignIn={signIn}
        />
      )
    }
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
            <i className="fa-brands fa-google" /> 以 Google 帳號登入
          </button>
        </div>
      </div>
    )
  }

  // Main app
  return (
    <div className="app-container">
      {/* Drawer overlay (mobile only) */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <Sidebar
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        trips={trips}
        activeTrip={activeTrip}
        activeDayIndex={activeDayIndex}
        onSelectTrip={id => { handleSetActiveTripId(id); setDrawerOpen(false) }}
        onNewTrip={() => { setTripToEdit(null); setShowTripModal(true) }}
        onEditTrip={trip => { setTripToEdit(trip); setShowTripModal(true) }}
        onSelectDay={i => { handleSetActiveDayIndex(i); setDrawerOpen(false) }}
        onAddDay={addDay}
        onRemoveDay={i => {
          if (!activeTrip || activeTrip.daysCount <= 1) { alert('至少需要保留一天行程！'); return }
          const acts = activeTrip.activities.filter(a => a.dayIndex === i)
          const msg = `確定要移除第 ${i + 1} 天嗎？` + (acts.length ? `\n此天共有 ${acts.length} 個行程將一併刪除。` : '')
          if (confirm(msg)) removeDay(activeTrip.id, i)
        }}
        user={user}
        onLogOut={logOut}
      />

      <main className="main-content" ref={mainContentRef}>
        {/* Mobile top header (hidden on desktop) */}
        <header className="mobile-header">
          <button className="btn-icon" onClick={() => setDrawerOpen(true)} title="開啟選單">
            <i className="fa-solid fa-bars" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeTrip ? activeTrip.name : 'StellarVoyage'}
            </div>
            {activeTrip && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                {formatDateRange(activeTrip.startDate, activeTrip.endDate)}
              </div>
            )}
          </div>
          {activeTrip && (
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              <button
                className="btn-icon"
                style={activeTrip.isShared ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
                title={activeTrip.isShared ? '關閉分享' : '開啟分享並複製連結'}
                onClick={() => handleShare(activeTrip.id)}
              >
                <i className={`fa-solid ${activeTrip.isShared ? 'fa-link' : 'fa-share-nodes'}`} />
              </button>
              <button className="btn-icon" title="成員分帳" onClick={() => setShowMembersModal(true)}>
                <i className="fa-solid fa-users-gear" />
              </button>
              <button className="btn-icon" style={{ color: 'var(--danger)', borderColor: 'hsla(354,85%,60%,0.3)' }}
                title="刪除旅程"
                onClick={() => {
                  if (confirm(`確定要刪除整個旅程「${activeTrip.name}」與所有相關行程嗎？`))
                    deleteTrip(activeTrip.id)
                }}
              >
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          )}
        </header>

        {/* Desktop top-nav (hidden on mobile) */}
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
            <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button id="btn-manage-members" className="btn btn-secondary"
                onClick={() => setShowMembersModal(true)}>
                <i className="fa-solid fa-users-gear" /> 成員分帳
              </button>
              <button
                className="btn btn-secondary"
                style={activeTrip.isShared ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
                onClick={() => handleShare(activeTrip.id)}
                title={activeTrip.isShared ? '關閉分享' : '開啟分享並複製連結'}
              >
                <i className={`fa-solid ${activeTrip.isShared ? 'fa-link' : 'fa-share-nodes'}`} />
                {activeTrip.isShared ? '分享中' : '分享'}
              </button>
              {shareCopied && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>✓ 連結已複製！</span>
              )}
              <button id="btn-delete-trip" className="btn btn-danger"
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
            className={mobileTab !== 'timeline' ? 'panel-hidden-mobile' : ''}
            activeTrip={activeTrip}
            activeDayIndex={activeDayIndex}
            activeFilter={activeCategoryFilter}
            onFilter={setFilter}
            onAddActivity={() => { setActToEdit(null); setShowActivityModal(true) }}
            onEditActivity={act => { setActToEdit(act); setShowActivityModal(true) }}
            onDeleteActivity={id => { if (selectedActivity?.id === id) setSelectedActivity(null); deleteActivity(id) }}
            selectedActivityId={selectedActivity?.id}
            onSelectActivity={act => { setSelectedActivity(act); setMobileTab('details') }}
            expenses={Object.fromEntries(
              Object.entries(localExpenses)
                .filter(([key]) => key.startsWith(`${user?.uid}_`))
                .map(([key, val]) => [key.replace(`${user?.uid}_`, ''), val])
            )}
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
            activeTrip={activeTrip}
            activeDayIndex={activeDayIndex}
            onUpdateDayMemo={memo => activeTrip && updateDayMemo(activeTrip.id, activeDayIndex, memo)}
          />
        </div>

        {/* Mobile bottom tab bar (hidden on desktop) */}
        <nav className="mobile-tab-bar">
          <button
            className={`mobile-tab-btn ${drawerOpen ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <i className="fa-solid fa-map" />
            <span>行程</span>
          </button>
          <button
            className={`mobile-tab-btn ${mobileTab === 'timeline' && !drawerOpen ? 'active' : ''}`}
            onClick={() => { setMobileTab('timeline'); setDrawerOpen(false) }}
          >
            <i className="fa-solid fa-list-check" />
            <span>時間軸</span>
          </button>
          <button
            className={`mobile-tab-btn ${mobileTab === 'details' && !drawerOpen ? 'active' : ''}`}
            onClick={() => { setMobileTab('details'); setDrawerOpen(false) }}
          >
            <i className="fa-solid fa-wallet" />
            <span>詳情</span>
          </button>
        </nav>
      </main>

      {showTripModal && (
        <TripModal
          tripToEdit={tripToEdit}
          onClose={() => { setShowTripModal(false); setTripToEdit(null) }}
          onSubmit={form => {
            if (tripToEdit) updateTrip(tripToEdit.id, form)
            else addTrip(form)
            setShowTripModal(false); setTripToEdit(null)
          }}
        />
      )}
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
      {showMembersModal && activeTrip && (
        <MembersModal
          members={activeTrip.members || []}
          onAddMember={name => addMember(activeTrip.id, name)}
          onDeleteMember={id => deleteMember(activeTrip.id, id)}
          onClose={() => setShowMembersModal(false)}
          allExpenses={
            (activeTrip.activities || []).flatMap(act => {
              const key = expKey(act.id)
              return (localExpenses[key] || [])
            })
          }
        />
      )}
      <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  )
}
