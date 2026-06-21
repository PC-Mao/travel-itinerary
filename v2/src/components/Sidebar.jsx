export default function Sidebar({ trips, activeTrip, activeDayIndex, onSelectTrip, onNewTrip, onSelectDay, onAddDay }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <i className="fa-solid fa-compass-drafting logo-icon" />
          <span>StellarVoyage</span>
        </div>
      </div>

      {/* Trip List */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3>我的旅程</h3>
          <button className="btn-icon" title="新增旅程" onClick={onNewTrip}>
            <i className="fa-solid fa-plus" />
          </button>
        </div>
        <ul className="trip-list">
          {trips.map(trip => (
            <li key={trip.id}
              className={`trip-item ${trip.id === activeTrip?.id ? 'active' : ''}`}
              onClick={() => onSelectTrip(trip.id)}
            >
              <div className="trip-item-info">
                <span className="trip-item-title">{trip.name}</span>
                <span className="trip-item-dates">{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
              <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)' }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Day Chips */}
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
              <button key={i}
                className={`day-chip ${i === activeDayIndex ? 'active' : ''}`}
                onClick={() => onSelectDay(i)}
              >
                <i className="fa-solid fa-calendar-day" /> Day {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="sidebar-footer">
        <p>&copy; 2026 StellarVoyage</p>
        <p>探索、規劃、珍藏記憶</p>
      </footer>
    </aside>
  )
}

function formatDateRange(start, end) {
  if (!start) return ''
  if (!end || start === end) return start
  return `${start} 至 ${end}`
}
