import { useState } from 'react'

const DEFAULT = { title: '', time: '09:00', category: 'sightseeing', location: '', desc: '' }

export default function ActivityModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(DEFAULT)
  const set = key => e => setForm(s => ({ ...s, [key]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.time) return
    onSubmit(form)
    setForm(DEFAULT)
  }

  return (
    <div className="modal open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass">
        <div className="modal-header">
          <h2><i className="fa-solid fa-circle-plus" /> 新增行程項目</h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>行程名稱 / 景點 <span className="required">*</span></label>
            <input type="text" required placeholder="例如：金閣寺參拜、新幹線前往東京"
              value={form.title} onChange={set('title')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>時間 <span className="required">*</span></label>
              <input type="time" required value={form.time} onChange={set('time')} />
            </div>
            <div className="form-group">
              <label>類型</label>
              <select value={form.category} onChange={set('category')}>
                <option value="sightseeing">景點 (Sightseeing)</option>
                <option value="flight">交通 (Transportation)</option>
                <option value="hotel">住宿 (Accommodation)</option>
                <option value="food">餐飲 (Dining)</option>
                <option value="other">其他 (Other)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>地點 / 地址</label>
            <input type="text" placeholder="例如：京都市北區金閣寺町1"
              value={form.location} onChange={set('location')} />
          </div>
          <div className="form-group">
            <label>詳細說明 / 備忘錄</label>
            <textarea rows="3" placeholder="門票 400 日圓，下午 5:00 關門，建議早點去拍照..."
              value={form.desc} onChange={set('desc')} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-link" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">加入行程</button>
          </div>
        </form>
      </div>
    </div>
  )
}
