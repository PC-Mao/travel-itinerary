import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import PlaceCard from './PlaceCard'
import MapView from './MapView'

export default function DayItinerary({ day, dayIndex, tripId, onAddPlace, onUpdatePlace, onDeletePlace, onReorder }) {
  const [addingPlace, setAddingPlace] = useState(false)
  const [form, setForm] = useState({ name: '', time: '', note: '' })
  const [pickingOnMap, setPickingOnMap] = useState(false)
  const [pendingLatLng, setPendingLatLng] = useState(null)
  const [showMap, setShowMap] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = day.places.findIndex(p => p.id === active.id)
    const newIndex = day.places.findIndex(p => p.id === over.id)
    const newOrder = arrayMove(day.places, oldIndex, newIndex).map(p => p.id)
    onReorder(tripId, dayIndex, newOrder)
  }

  function handleMapClick(latlng) {
    setPendingLatLng(latlng)
    setPickingOnMap(false)
    setAddingPlace(true)
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name) return
    onAddPlace(tripId, dayIndex, { ...form, ...(pendingLatLng ? { lat: pendingLatLng.lat, lng: pendingLatLng.lng } : {}) })
    setForm({ name: '', time: '', note: '' })
    setPendingLatLng(null)
    setAddingPlace(false)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">
          Day {dayIndex + 1} <span className="text-gray-400 font-normal text-sm ml-1">{day.date}</span>
        </h3>
        <div className="flex gap-2 text-xs">
          <button onClick={() => setShowMap(v => !v)} className="text-blue-500 hover:underline">
            {showMap ? '隱藏地圖' : '顯示地圖'}
          </button>
          <button onClick={() => { setPickingOnMap(true); setShowMap(true) }} className="text-green-600 hover:underline">
            📍 從地圖選點
          </button>
          <button onClick={() => setAddingPlace(v => !v)} className="text-blue-600 hover:underline">
            + 新增景點
          </button>
        </div>
      </div>

      {showMap && (
        <div className="mb-3">
          {pickingOnMap && (
            <p className="text-xs text-green-700 mb-1 bg-green-50 px-2 py-1 rounded">點擊地圖以選取景點位置…</p>
          )}
          <MapView
            places={day.places}
            onMapClick={pickingOnMap ? handleMapClick : null}
          />
        </div>
      )}

      {addingPlace && (
        <form onSubmit={handleAdd} className="mb-3 p-3 bg-gray-50 rounded-lg border space-y-2">
          {pendingLatLng && (
            <p className="text-xs text-green-600">已選位置：{pendingLatLng.lat.toFixed(5)}, {pendingLatLng.lng.toFixed(5)}</p>
          )}
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="景點名稱 *" value={form.name}
            onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="時間（例：09:00）" value={form.time}
            onChange={e => setForm(v => ({ ...v, time: e.target.value }))} />
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="備注" value={form.note}
            onChange={e => setForm(v => ({ ...v, note: e.target.value }))} />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">新增</button>
            <button type="button" onClick={() => { setAddingPlace(false); setPendingLatLng(null) }} className="text-xs text-gray-500">取消</button>
          </div>
        </form>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={day.places.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {day.places.length === 0
              ? <p className="text-xs text-gray-400 py-2 pl-1">尚無景點</p>
              : day.places.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onUpdate={(id, updates) => onUpdatePlace(tripId, dayIndex, id, updates)}
                  onDelete={id => onDeletePlace(tripId, dayIndex, id)}
                />
              ))
            }
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
