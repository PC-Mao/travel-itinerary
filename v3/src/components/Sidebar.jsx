export default function Sidebar({ drawerOpen, onCloseDrawer, trips, activeTrip, activeDayIndex, onSelectTrip, onNewTrip, onEditTrip, onSelectDay, onAddDay, onRemoveDay, user, onLogOut }) {
  return (
    <aside className={`sidebar ${drawerOpen ? 'drawer-open' : ''}`}>
      <div className="brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <i className="fa-solid fa-compass-drafting logo-icon" />
          <span>StellarVoyage</span>
        </div>
        <button className="btn-icon drawer-close-btn" title="關閉選單" onClick={onCloseDrawer}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>我的旅程</h3>
          <button className="btn-icon" title="新增旅程" onClick={onNewTrip}>
            <i className="fa-solid fa-plus" />
          </button>
        </div>
        <ul className="trip-list">
          {trips.length === 0 && (
            <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 4px' }}>
              尚無旅程，點擊「+」新增
            </li>
          )}
          {trips.map(trip => (
            <li key={trip.id}
              className={`trip-item ${trip.id === activeTrip?.id ? 'active' : ''}`}
              onClick={() => onSelectTrip(trip.id)}
            >
              <div className="trip-item-info" style={{ flex: 1, minWidth: 0 }}>
                <span className="trip-item-title">{trip.name}</span>
                <span className="trip-item-dates">{trip.startDate} 至 {trip.endDate}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                <button className="btn-icon btn-edit-trip" title="編輯旅程"
                  style={{ width: 26, height: 26, fontSize: '0.75rem' }}
                  onClick={e => { e.stopPropagation(); onEditTrip(trip) }}>
                  <i className="fa-solid fa-pen" />
                </button>
                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)' }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeTrip && (
        <div className="sidebar-section">
          <div className="section-header">
            <h3>日程規劃</h3>
            <button className="btn-icon" title="新增天數" onClick={onAddDay}>
              <i className="fa-solid fa-calendar-plus" />
            </button>
          </div>
          <div className="day-chips-container">
            {Array.from({ length: activeTrip.daysCount }, (_, i) => (
              <div key={i} className={`day-chip ${i === activeDayIndex ? 'active' : ''}`}>
                <button className="day-chip-label" onClick={() => {
                  onSelectDay(i)
                  // Scroll to day header in timeline
                  setTimeout(() => {
                    const el = document.getElementById(`timeline-day-${i}`)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 50)
                }}>
                  <i className="fa-solid fa-calendar-day" /> Day {i + 1}
                </button>
                <button className="day-chip-remove" title={`移除第 ${i + 1} 天`}
                  onClick={e => { e.stopPropagation(); onRemoveDay(i) }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer"
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)' }} />
            <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {user.displayName}
            </span>
            <button onClick={onLogOut} title="登出"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        )}
        <p>&copy; 2026 StellarVoyage</p>
        <p>探索、規劃、珍藏記憶</p>
      </footer>
    </aside>
  )
}
