import { useRef, useState } from 'react'

export default function DetailsPanel({
  className = '',
  selectedActivity, photos, onAddPhoto, onDeletePhoto, onOpenLightbox,
  expenses, onAddExpense, onDeleteExpense,
  activeTrip, activeDayIndex, onUpdateDayMemo,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses')
  const [expForm, setExpForm] = useState({ purpose: '', payerId: '', amount: '', sharedMemberIds: [] })
  const [editingMemo, setEditingMemo] = useState(false)
  const [memoText, setMemoText] = useState('')

  const dayMemo = activeTrip?.dayMemos?.[activeDayIndex] || ''
  const members = activeTrip?.members || []

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => onAddPhoto(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  function toggleSplitMember(memberId) {
    setExpForm(s => ({
      ...s,
      sharedMemberIds: s.sharedMemberIds.includes(memberId)
        ? s.sharedMemberIds.filter(id => id !== memberId)
        : [...s.sharedMemberIds, memberId],
    }))
  }

  function handleExpSubmit(e) {
    e.preventDefault()
    const amount = Number(expForm.amount)
    if (!amount || amount <= 0) return
    if (members.length > 0 && !expForm.payerId) return
    if (members.length > 0 && expForm.sharedMemberIds.length === 0) {
      alert('請至少選擇一位參與分攤的人員！')
      return
    }
    const sharedIds = members.length > 0 ? expForm.sharedMemberIds : []
    onAddExpense({
      purpose: expForm.purpose.trim() || '一般消費',
      amount,
      payerId: expForm.payerId,
      sharedMemberIds: sharedIds,
    })
    setExpForm({ purpose: '', payerId: '', amount: '', sharedMemberIds: [] })
  }

  const total = expenses.reduce((s, ex) => s + ex.amount, 0)

  function getPayerName(payerId) {
    return members.find(m => m.id === payerId)?.name || '未知'
  }

  function getSharedNames(sharedMemberIds) {
    if (!sharedMemberIds || sharedMemberIds.length === 0) return '全員'
    return sharedMemberIds.map(id => members.find(m => m.id === id)?.name || '?').join(', ')
  }

  function saveMemo() {
    onUpdateDayMemo(memoText.trim())
    setEditingMemo(false)
  }

  return (
    <section className={`panel details-panel ${className}`}>
      {/* Day memo card — always shown when a trip is active */}
      {activeTrip && (
        <div id="details-day-memo-container" style={{ width: '100%', marginBottom: '4px' }}>
          <div className="timeline-day-memo-card">
            {editingMemo ? (
              <div className="day-memo-edit-container">
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '2px' }}>
                  <i className="fa-solid fa-calendar-day" /> 第 {activeDayIndex + 1} 天備忘錄
                </div>
                <textarea className="day-memo-textarea" rows={2} autoFocus
                  placeholder={`在此輸入第 ${activeDayIndex + 1} 天備忘錄…`}
                  value={memoText}
                  onChange={e => setMemoText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveMemo()
                    if (e.key === 'Escape') setEditingMemo(false)
                  }}
                />
                <div className="day-memo-edit-actions">
                  <button className="btn btn-secondary btn-memo-cancel"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => setEditingMemo(false)}>
                    <i className="fa-solid fa-xmark" /> 取消
                  </button>
                  <button className="btn btn-primary btn-memo-save"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={saveMemo}>
                    <i className="fa-solid fa-check" /> 儲存
                  </button>
                </div>
              </div>
            ) : (
              <div className={`day-memo-display ${!dayMemo ? 'empty' : ''}`}
                onClick={() => { setMemoText(dayMemo); setEditingMemo(true) }}>
                <i className="fa-solid fa-note-sticky day-memo-icon" style={!dayMemo ? { opacity: 0.5 } : {}} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '2px' }}>
                    第 {activeDayIndex + 1} 天備忘錄
                  </span>
                  <span className="day-memo-text">
                    {dayMemo || '點擊在此新增今日備忘錄...'}
                  </span>
                </div>
                <i className={`fa-solid ${dayMemo ? 'fa-pen' : 'fa-plus'} day-memo-edit-btn text-muted`}
                  style={{ fontSize: '0.75rem', marginLeft: '8px', ...(!dayMemo ? { opacity: 0.5 } : {}) }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inactive state */}
      {!selectedActivity && (
        <div id="details-inactive-state" className="empty-state" style={{ display: 'flex' }}>
          <i className="fa-solid fa-arrow-pointer" style={{ fontSize: '3.5rem', marginBottom: '8px', opacity: 0.5 }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>探索行程詳情</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '320px', color: 'var(--text-muted)' }}>
            請點擊左側行程規劃表中的任一「行程項目」，即可開啟該活動的旅遊照片與記帳管理。
          </p>
        </div>
      )}

      {/* Active state */}
      {selectedActivity && (
        <div id="details-active-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Panel header + tabs */}
          <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h2 id="details-heading" style={{ fontSize: '1.15rem' }}>
              <i className="fa-solid fa-map-pin icon-accent" />
              <span id="details-title-text" style={{ marginLeft: '8px' }}>{selectedActivity.title}</span>
            </h2>
            <div className="segmented-control">
              <button className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                <i className="fa-solid fa-wallet" /> 景點記帳
              </button>
              <button className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
                <i className="fa-solid fa-images" /> 照片記錄
              </button>
            </div>
          </div>

          {/* Tab: 景點記帳 */}
          {activeTab === 'expenses' && (
            <div id="subtab-expenses" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(180, 100%, 48%, 0.05)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid hsla(180, 100%, 48%, 0.15)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>本項景點總花費</span>
                <span id="activity-expense-total" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                  ${total.toLocaleString()}
                </span>
              </div>

              {/* Expense list */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '2px' }}>
                {expenses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                    尚無消費紀錄，記下第一筆支出吧！
                  </p>
                ) : expenses.map(ex => (
                  <div key={ex.id} className="expense-item">
                    <div className="expense-item-info">
                      <span className="expense-purpose">{ex.purpose || '未填項目'}</span>
                      <span className="expense-meta" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {ex.payerId ? `付款：${getPayerName(ex.payerId)} | 分攤：${getSharedNames(ex.sharedMemberIds)}` : ex.time}
                      </span>
                    </div>
                    <div className="expense-amount-area">
                      <span className="expense-amount">${ex.amount.toLocaleString()}</span>
                      <button className="btn-icon" style={{ width: 24, height: 24, flexShrink: 0 }}
                        onClick={() => onDeleteExpense(ex.id)} title="刪除">
                        <i className="fa-solid fa-xmark" style={{ fontSize: '0.75rem', color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add expense form */}
              <form onSubmit={handleExpSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-plus-circle" style={{ color: 'var(--accent-cyan)' }} /> 新增消費紀錄
                </h4>

                {/* Payer & amount */}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>付款人 {members.length > 0 && <span className="required">*</span>}</label>
                    {members.length > 0 ? (
                      <select value={expForm.payerId} required
                        onChange={e => setExpForm(s => ({ ...s, payerId: e.target.value }))}
                        style={{ padding: '8px 12px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <option value="" disabled>選擇付款人</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    ) : (
                      <input type="text" placeholder="先至成員分帳新增旅伴" disabled
                        style={{ padding: '8px 12px', fontSize: '0.9rem', opacity: 0.5 }} />
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>金額 ($) <span className="required">*</span></label>
                    <input type="number" min="1" required placeholder="例如：200"
                      style={{ padding: '8px 12px', fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      value={expForm.amount} onChange={e => setExpForm(s => ({ ...s, amount: e.target.value }))} />
                  </div>
                </div>

                {/* Purpose */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>消費項目 / 用途</label>
                  <input type="text" placeholder="例如：門票、餐費（選填）"
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                    value={expForm.purpose} onChange={e => setExpForm(s => ({ ...s, purpose: e.target.value }))} />
                </div>

                {/* Split members */}
                {members.length > 0 && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>參與分攤人員 <span className="required">*</span></label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {members.map(m => (
                        <label key={m.id} className="checkbox-chip">
                          <input type="checkbox"
                            checked={expForm.sharedMemberIds.includes(m.id)}
                            onChange={() => toggleSplitMember(m.id)} />
                          {m.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-check" /> 加入帳目
                </button>
              </form>
            </div>
          )}

          {/* Tab: 照片記錄 */}
          {activeTab === 'photos' && (
            <div id="subtab-photos" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>已連結至此行程的精彩照片</span>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => inputRef.current?.click()}>
                  <i className="fa-solid fa-cloud-arrow-up" /> 照片
                </button>
                <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)} />
              </div>

              <div
                id="dropzone"
                className={`dropzone ${dragging ? 'dragover' : ''}`}
                onDragEnter={e => { e.preventDefault(); setDragging(true) }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
              >
                <i className="fa-solid fa-images dropzone-icon" />
                <p>拖放照片至此，或點擊上方按鈕上傳</p>
              </div>

              <div className="photo-grid" id="photo-grid">
                {photos.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1/-1', padding: '32px 16px' }}>
                    <i className="fa-solid fa-camera" />
                    <p>尚無照片，記錄此行程的精彩回憶吧！</p>
                  </div>
                ) : photos.map(photo => (
                  <div key={photo.id} className="photo-card" onClick={() => onOpenLightbox(photo)}>
                    <img src={photo.data} alt="Travel memory" />
                    <div className="photo-overlay">
                      <span className="photo-meta">{selectedActivity.title}</span>
                    </div>
                    <button className="btn-delete-photo"
                      onClick={e => { e.stopPropagation(); if (confirm('確定要刪除這張照片嗎？')) onDeletePhoto(photo.id) }}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
