import { useState } from 'react'

const CATEGORY_LABELS = { flight: '交通', hotel: '住宿', sightseeing: '景點', food: '餐飲', other: '其他' }

export default function SharedTripView({ trip, onSignIn }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')

  const FILTERS = [
    { key: 'all', label: '全部' },
    { key: 'flight', label: '交通', icon: 'fa-plane' },
    { key: 'hotel', label: '住宿', icon: 'fa-hotel' },
    { key: 'sightseeing', label: '景點', icon: 'fa-camera-retro' },
    { key: 'food', label: '餐飲', icon: 'fa-utensils' },
    { key: 'other', label: '其他', icon: 'fa-ellipsis' },
  ]

  let activities = (trip.activities || []).filter(a => a.dayIndex === activeDayIndex)
  if (activeFilter !== 'all') activities = activities.filter(a => a.category === activeFilter)
  activities = [...activities].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Read-only banner */}
      <div style={{ background: 'hsla(250, 95%, 68%, 0.12)', borderBottom: '1px solid var(--accent-indigo)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--accent-indigo)' }}>
          <i className="fa-solid fa-eye" style={{ marginRight: '8px' }} />
          您正在以唯讀模式瀏覽分享的行程
        </span>
        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onSignIn}>
          <i className="fa-brands fa-google" /> 登入以建立自己的旅程
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Trip header */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {trip.name}
          </h1>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
            {trip.startDate} 至 {trip.endDate}　·　共 {trip.daysCount} 天
          </span>
        </div>

        {/* Day selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {Array.from({ length: trip.daysCount }, (_, i) => (
            <button key={i}
              className={`day-chip ${i === activeDayIndex ? 'active' : ''}`}
              onClick={() => { setActiveDayIndex(i); setActiveFilter('all') }}
            >
              <i className="fa-solid fa-calendar-day" /> Day {i + 1}
            </button>
          ))}
        </div>

        {/* Timeline panel */}
        <div className="panel">
          <div className="panel-header">
            <h2><i className="fa-solid fa-route icon-accent" /> 行程規劃表</h2>
          </div>

          {/* Filters */}
          <div className="category-filters">
            {FILTERS.map(f => (
              <button key={f.key}
                className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.icon && <i className={`fa-solid ${f.icon}`} />} {f.label}
              </button>
            ))}
          </div>

          {/* Activities */}
          <div className="timeline-container">
            {activities.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-calendar-xmark" />
                <p>此日無符合條件的行程項目。</p>
              </div>
            ) : activities.map(act => (
              <article key={act.id} className="timeline-item" style={{ cursor: 'default' }}>
                <div className="timeline-bullet" />
                <span className="timeline-time-badge">{act.time}</span>
                <div className="timeline-title-row">
                  <h4>{act.title}</h4>
                  <span className={`activity-badge badge-${act.category}`}>
                    {CATEGORY_LABELS[act.category] || '其他'}
                  </span>
                </div>
                {act.location && (
                  <div className="timeline-location">
                    <i className="fa-solid fa-location-dot" />
                    <span>{act.location}</span>
                  </div>
                )}
                {act.desc && <p className="timeline-desc">{act.desc}</p>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
