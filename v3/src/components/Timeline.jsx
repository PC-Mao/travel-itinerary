const CATEGORY_LABELS = { flight: '交通', hotel: '住宿', sightseeing: '景點', food: '餐飲', other: '其他' }
const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'flight', label: '交通', icon: 'fa-plane' },
  { key: 'hotel', label: '住宿', icon: 'fa-hotel' },
  { key: 'sightseeing', label: '景點', icon: 'fa-camera-retro' },
  { key: 'food', label: '餐飲', icon: 'fa-utensils' },
  { key: 'other', label: '其他', icon: 'fa-ellipsis' },
]

export default function Timeline({ className = '', activeTrip, activeDayIndex, activeFilter, onFilter, onAddActivity, onEditActivity, onDeleteActivity, selectedActivityId, onSelectActivity, expenses }) {
  const hasTrip = !!activeTrip

  // Only show activities for the selected day
  let activities = hasTrip
    ? activeTrip.activities.filter(a => a.dayIndex === activeDayIndex)
    : []
  if (activeFilter !== 'all') activities = activities.filter(a => a.category === activeFilter)
  activities = [...activities].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <section className={`panel timeline-panel ${className}`}>
      <div className="panel-header">
        <h2><i className="fa-solid fa-route icon-accent" /> 行程規劃表</h2>
        <button className="btn btn-primary" disabled={!hasTrip} onClick={onAddActivity}>
          <i className="fa-solid fa-plus-circle" /> 新增行程
        </button>
      </div>

      <div className="category-filters" id="category-filters">
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
        ) : (
          <>
            {/* Current day header */}
            <div className="timeline-day-header" id={`timeline-day-${activeDayIndex}`}>
              <i className="fa-solid fa-calendar-day" /> 第 {activeDayIndex + 1} 天 (Day {activeDayIndex + 1})
            </div>

            {activities.length === 0 ? (
              <div className="timeline-day-empty">
                此日尚無排定該類型的行程，點擊右上角「新增行程」規劃日程吧！
              </div>
            ) : activities.map(act => {
              const actExpenses = expenses?.[act.id] || []
              const expTotal = actExpenses.reduce((s, e) => s + e.amount, 0)

              return (
                <article
                  key={act.id}
                  className={`timeline-item ${act.id === selectedActivityId ? 'active' : ''}`}
                  onClick={() => onSelectActivity(act.id === selectedActivityId ? null : act)}
                >
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
                  {expTotal > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, marginTop: '6px' }}>
                      <i className="fa-solid fa-wallet" /> 支出: ${expTotal.toLocaleString()}
                    </span>
                  )}
                  <div className="timeline-actions">
                    <button className="btn-icon" title="編輯行程" style={{ marginRight: '8px' }}
                      onClick={e => { e.stopPropagation(); onEditActivity(act) }}>
                      <i className="fa-solid fa-pen" style={{ color: 'var(--accent-cyan)' }} />
                    </button>
                    <button className="btn-icon" title="刪除行程"
                      onClick={e => {
                        e.stopPropagation()
                        if (confirm(`確定要刪除行程「${act.title}」嗎？`)) onDeleteActivity(act.id)
                      }}>
                      <i className="fa-solid fa-trash-can" style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </article>
              )
            })}
          </>
        )}
      </div>
    </section>
  )
}
