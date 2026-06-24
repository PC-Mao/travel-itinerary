import { useState, useEffect, useRef } from 'react'

export default function TripModal({ onClose, onSubmit, tripToEdit }) {
  const isEdit = !!tripToEdit
  const canClose = useRef(false)
  useEffect(() => {
    const t = setTimeout(() => { canClose.current = true }, 300)
    return () => clearTimeout(t)
  }, [])
  const [form, setForm] = useState({
    name: tripToEdit?.name || '',
    startDate: tripToEdit?.startDate || '',
    endDate: tripToEdit?.endDate || '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <div className="modal open" onClick={e => {
      if (!canClose.current) return
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="modal-content glass">
        <div className="modal-header">
          <h2>
            <i className={`fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-earth-asia'}`} />
            {isEdit ? ' 編輯旅程' : ' 建立新旅程'}
          </h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>旅程名稱 <span className="required">*</span></label>
            <input type="text" required placeholder="例如：京都楓葉五日遊、巴黎塞納河畔"
              value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>出發日期</label>
              <input type="date" value={form.startDate}
                onChange={e => setForm(s => ({ ...s, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>回程日期</label>
              <input type="date" value={form.endDate}
                onChange={e => setForm(s => ({ ...s, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-link" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">{isEdit ? '確認修改' : '建立'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
