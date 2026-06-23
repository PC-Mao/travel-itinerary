import { useState } from 'react'

export default function MembersModal({ members, onAddMember, onDeleteMember, onClose }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAddMember(name.trim())
    setName('')
  }

  return (
    <div className="modal open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2><i className="fa-solid fa-users-gear" /> 成員管理</h2>
          <span className="close-btn" onClick={onClose}>&times;</span>
        </div>

        {/* Add member form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label htmlFor="member-nickname">新增成員暱稱</label>
            <input type="text" id="member-nickname" required placeholder="例如：小明、佳佳、阿華"
              value={name} onChange={e => setName(e.target.value)} style={{ padding: '10px 14px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px' }}>
            <i className="fa-solid fa-plus" /> 新增
          </button>
        </form>

        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>當前旅程成員</h4>

        {members.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
            尚無成員，新增旅伴開始分帳規劃！
          </p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', padding: '2px' }}>
            {members.map(m => (
              <li key={m.id} className="member-item">
                <div className="member-name-group">
                  <div className="member-avatar">{m.name.charAt(0)}</div>
                  <span>{m.name}</span>
                </div>
                <button className="btn-icon" style={{ width: 28, height: 28 }}
                  onClick={() => { if (confirm(`確定要移除成員「${m.name}」嗎？`)) onDeleteMember(m.id) }}>
                  <i className="fa-solid fa-xmark" style={{ fontSize: '0.8rem', color: 'var(--danger)' }} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-footer" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  )
}
