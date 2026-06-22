import { useRef, useState } from 'react'

export default function GalleryPanel({ selectedActivity, photos, onAddPhoto, onDeletePhoto, onOpenLightbox }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const hasActivity = !!selectedActivity

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => onAddPhoto(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  return (
    <section className="panel gallery-panel">
      {/* Inactive: no activity selected */}
      {!hasActivity && (
        <div className="empty-state" style={{ display: 'flex' }}>
          <i className="fa-solid fa-arrow-pointer" style={{ fontSize: '3.5rem', marginBottom: '8px' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>探索景點相簿</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '320px', color: 'var(--text-muted)' }}>
            請點擊左側行程規劃表中的任一「行程項目」，即可開啟該活動的旅遊相簿並上傳照片。
          </p>
        </div>
      )}

      {/* Active: activity selected */}
      {hasActivity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div className="panel-header">
            <h2>
              <i className="fa-solid fa-images icon-accent" />
              {selectedActivity.title}
            </h2>
            <button className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
              <i className="fa-solid fa-cloud-arrow-up" /> 照片
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)} />
          </div>

          <div className="gallery-info-bar">
            <span>在這裡留下精彩瞬間，已連結至特定行程</span>
          </div>

          {/* Dropzone */}
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

          {/* Photo Grid */}
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
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm('確定要刪除這張照片嗎？')) onDeletePhoto(photo.id)
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
