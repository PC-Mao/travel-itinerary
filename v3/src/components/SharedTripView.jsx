import { useState } from 'react'
import Timeline from './Timeline'
import ActivityModal from './modals/ActivityModal'

export default function SharedTripView({ trip, activeDayIndex, setActiveDayIndex, activeCategoryFilter, setFilter, addActivity, deleteActivity, addDay, user, onSignIn }) {
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
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

      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {trip.name}
          </h1>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
            {trip.startDate} 至 {trip.endDate}　·　共 {trip.daysCount} 天
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
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

        <Timeline
          activeTrip={trip}
          activeDayIndex={activeDayIndex}
          activeFilter={activeCategoryFilter}
          onFilter={setFilter}
          onAddActivity={() => setShowActivityModal(true)}
          onDeleteActivity={id => { if (selectedActivity?.id === id) setSelectedActivity(null); deleteActivity(id) }}
          selectedActivityId={selectedActivity?.id}
          onSelectActivity={setSelectedActivity}
        />
      </div>

      {showActivityModal && (
        <ActivityModal
          onClose={() => setShowActivityModal(false)}
          onSubmit={act => { addActivity(act); setShowActivityModal(false) }}
        />
      )}
    </div>
  )
}
