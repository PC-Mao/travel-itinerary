import { useState } from 'react'

export default function TripList({ trips, onSelect, onAdd, onDelete, onImport }) {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.endDate) return
    onAdd(form)
    setForm({ name: '', startDate: '', endDate: '' })
    setShowForm(false)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的旅行計畫</h1>
        <div className="flex gap-2">
          <label className="cursor-pointer px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
            匯入 JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            + 新增旅行
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl border space-y-3">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="旅行名稱"
            value={form.name}
            onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
          />
          <div className="flex gap-2">
            <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={form.startDate}
              onChange={e => setForm(v => ({ ...v, startDate: e.target.value }))} />
            <span className="self-center text-gray-400">—</span>
            <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={form.endDate}
              onChange={e => setForm(v => ({ ...v, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 text-sm text-gray-600">取消</button>
            <button type="submit" className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">建立</button>
          </div>
        </form>
      )}

      {trips.length === 0 ? (
        <p className="text-gray-400 text-center py-12">尚無旅行計畫，點擊「新增旅行」開始規劃！</p>
      ) : (
        <ul className="space-y-3">
          {trips.map(trip => (
            <li key={trip.id}
              onClick={() => onSelect(trip.id)}
              className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-md cursor-pointer transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{trip.name}</p>
                <p className="text-sm text-gray-500">{trip.startDate} ～ {trip.endDate}（{trip.days?.length ?? 0} 天）</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(trip.id) }}
                className="text-red-400 hover:text-red-600 text-sm px-2"
              >刪除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
