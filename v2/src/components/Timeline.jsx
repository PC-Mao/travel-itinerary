const CATEGORY_LABELS = { flight: '交通', hotel: '住宿', sightseeing: '景點', food: '餐飲', other: '其他' }
const FILTERS = [
  { key: 'all', label: '全部', icon: null },
  { key: 'flight', label: '交通', icon: 'fa-plane' },
  { key: 'hotel', label: '住宿', icon: 'fa-hotel' },
  { key: 'sightseeing', label: '景點', icon: 'fa-camera-retro' },
  { key: 'food', label: '餐飲', icon: 'fa-utensils' },
  { key: 'other', label: '其他', icon: 'fa-ellipsis' },
]

export default function Timeline({ activeTrip, activeDayIndex, activeFilter, onFilter, onAddActivity, onDeleteActivity }) {
  const hasTrip = !!activeTrip

  let activities = hasTrip
    ? activeTrip.activities.filter(a => a.dayIndex === activeDayIndex)
    : []

  if (activeFilter !== 'all') {
    activities = activities.filter(a => a.category === activeFilter)
  }
  activities = [...activities].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <section className="panel timeline-panel">
      <div className="panel-header">
        <h2><i className="fa-solid fa-route icon-accent" /> 行程規劃表</h2>
        <button className="btn btn-primary" disabled={!hasTrip} onClick={onAddActivity}>
          <i className="fa-solid fa-plus-circle" /> 新增行程
        </button>
      </div>

      {/* Category filters */}
      <div className="category-filters">
        {FILTERS.map(f => (
          <button key={f.key}
            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => onFilter(f.key)}
          >
            {f.icon && <i className={`fa-solid ${f.icon}`} />} {f.label}
          </button>
        ))}
      </div>

      <div className="timeline-container">
        {!hasTrip ? (
          <div className="empty-state">
            <i className="fa-solid fa-map-location-dot" />
            <p>點擊左側「+」按鈕建立新旅程，開啟您的探索之旅！</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-xmark" />
            <p>今天沒有排定此類型的行程項目。點擊右上角「新增行程」規劃日程吧！</p>
          </div>
        ) : activities.map(act => (
          <article key={act.id} className="timeline-item">
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
            <div className="timeline-actions">
              <button className="btn-icon" title="刪除行程"
                onClick={() => {
                  if (confirm(`確定要刪除行程「${act.title}」嗎？`)) onDeleteActivity(act.id)
                }}
              >
                <i className="fa-solid fa-trash-can" style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
