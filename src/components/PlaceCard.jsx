import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function PlaceCard({ place, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: place.name, time: place.time ?? '', note: place.note ?? '' })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: place.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  function handleSave() {
    onUpdate(place.id, form)
    setEditing(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2 p-3 bg-white rounded-lg border">
      {/* drag handle */}
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mt-0.5 select-none">⠿</span>

      {editing ? (
        <div className="flex-1 space-y-2">
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.name}
            onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="景點名稱" />
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.time}
            onChange={e => setForm(v => ({ ...v, time: e.target.value }))} placeholder="時間（例：09:00）" />
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.note}
            onChange={e => setForm(v => ({ ...v, note: e.target.value }))} placeholder="備注" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">儲存</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs text-gray-500">取消</button>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {place.time && <span className="text-xs text-blue-500 font-mono">{place.time}</span>}
            <span className="text-sm font-medium text-gray-800">{place.name}</span>
          </div>
          {place.note && <p className="text-xs text-gray-400 mt-0.5">{place.note}</p>}
          {place.lat && place.lng && (
            <p className="text-xs text-green-500 mt-0.5">📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
          )}
        </div>
      )}

      <div className="flex gap-1">
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500 text-xs">編輯</button>
        <button onClick={() => onDelete(place.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
      </div>
    </div>
  )
}
