import DayItinerary from './DayItinerary'

export default function TripDetail({ trip, onBack, onAddPlace, onUpdatePlace, onDeletePlace, onReorder, onExport }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-blue-500 hover:underline text-sm">← 返回列表</button>
        <button onClick={() => onExport(trip.id)} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
          匯出 JSON
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">{trip.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{trip.startDate} ～ {trip.endDate}</p>

      {trip.days.map((day, i) => (
        <DayItinerary
          key={day.date}
          day={day}
          dayIndex={i}
          tripId={trip.id}
          onAddPlace={onAddPlace}
          onUpdatePlace={onUpdatePlace}
          onDeletePlace={onDeletePlace}
          onReorder={onReorder}
        />
      ))}
    </div>
  )
}
