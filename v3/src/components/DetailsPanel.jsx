import { useRef, useState } from 'react'

export default function DetailsPanel({ selectedActivity, photos, onAddPhoto, onDeletePhoto, onOpenLightbox, expenses, onAddExpense, onDeleteExpense }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses')
  const [expenseForm, setExpenseForm] = useState({ purpose: '', amount: '' })

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => onAddPhoto(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  function handleExpenseSubmit(e) {
    e.preventDefault()
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount))) return
    onAddExpense({ purpose: expenseForm.purpose, amount: Number(expenseForm.amount) })
    setExpenseForm({ purpose: '', amount: '' })
  }

  const totalExpense = expenses.reduce((sum, ex) => sum + ex.amount, 0)

  return (
    <section className="panel details-panel">
      {/* Inactive state */}
      {!selectedActivity && (
        <div id="details-inactive-state" className="empty-state" style={{ display: 'flex' }}>
          <i className="fa-solid fa-arrow-pointer" style={{ fontSize: '3.5rem', marginBottom: '8px' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>探索行程詳情</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '320px', color: 'var(--text-muted)' }}>
            請點擊左側行程規劃表中的任一「行程項目」，即可開啟該活動的旅遊照片與記帳管理。
          </p>
        </div>
      )}

      {/* Active state */}
      {selectedActivity && (
        <div id="details-active-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Header + Tabs */}
          <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '1.1rem' }}>
              <i className="fa-solid fa-map-pin icon-accent" />
              <span style={{ marginLeft: '8px' }}>{selectedActivity.title}</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Total bar */}
              <div className="expense-total-bar">
                <span>本項景點總花費</span>
                <span>${totalExpense.toLocaleString()}</span>
              </div>

              {/* Expense list */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                    尚無消費紀錄
                  </p>
                ) : expenses.map(ex => (
                  <div key={ex.id} className="expense-item">
                    <div className="expense-item-info">
                      <span className="expense-item-purpose">{ex.purpose || '未填項目'}</span>
                      <span className="expense-item-meta">{ex.time}</span>
                    </div>
                    <span className="expense-item-amount">${ex.amount.toLocaleString()}</span>
                    <button className="btn-delete-expense" onClick={() => onDeleteExpense(ex.id)}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add expense form */}
              <form onSubmit={handleExpenseSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-plus-circle" style={{ color: 'var(--accent-cyan)' }} /> 新增消費紀錄
                </h4>
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>消費項目</label>
                    <input type="text" placeholder="例如：門票、餐費" style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                      value={expenseForm.purpose} onChange={e => setExpenseForm(s => ({ ...s, purpose: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>金額 ($) <span className="required">*</span></label>
                    <input type="number" min="1" required placeholder="例如：200" style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                      value={expenseForm.amount} onChange={e => setExpenseForm(s => ({ ...s, amount: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-check" /> 加入帳目
                </button>
              </form>
            </div>
          )}

          {/* Tab: 照片記錄 */}
          {activeTab === 'photos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>已連結至此行程的精彩照片</span>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => inputRef.current?.click()}>
                  <i className="fa-solid fa-cloud-arrow-up" /> 照片
                </button>
                <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)} />
              </div>

              <div
                className={`dropzone ${dragging ? 'dragover' : ''}`}
                onDragEnter={e => { e.preventDefault(); setDragging(true) }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
              >
                <i className="fa-solid fa-images dropzone-icon" />
                <p>拖放照片至此，或點擊上方按鈕上傳</p>
              </div>

              <div className="photo-grid">
                {photos.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                    <i className="fa-solid fa-camera" />
                    <p>尚無照片，上傳此行程的精彩回憶吧！</p>
                  </div>
                ) : photos.map(photo => (
                  <div key={photo.id} className="photo-card" onClick={() => onOpenLightbox(photo)}>
                    <img src={photo.data} alt="Travel memory" />
                    <div className="photo-overlay">
                      <span className="photo-meta">{selectedActivity.title}</span>
                    </div>
                    <button className="btn-delete-photo"
                      onClick={e => { e.stopPropagation(); if (confirm('確定要刪除這張照片嗎？')) onDeletePhoto(photo.id) }}
                    >
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
