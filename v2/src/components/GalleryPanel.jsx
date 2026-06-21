import { useRef, useState } from 'react'

export default function GalleryPanel({ activeTrip, activeDayIndex, onAddPhoto, onDeletePhoto, onOpenLightbox }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const hasTrip = !!activeTrip
  const photos = hasTrip ? activeTrip.photos.filter(p => p.dayIndex === activeDayIndex) : []

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
      <div className="panel-header">
        <h2><i className="fa-solid fa-images icon-accent" /> 旅遊相簿記錄</h2>
        <button className="btn btn-secondary" disabled={!hasTrip} onClick={() => inputRef.current?.click()}>
          <i className="fa-solid fa-cloud-arrow-up" /> 上傳照片
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)} />
      </div>

      <div className="gallery-info-bar">
        <span>在這裡留下精彩瞬間，可連結至特定日程</span>
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone ${!hasTrip ? 'disabled' : ''} ${dragging ? 'dragover' : ''}`}
        onDragEnter={e => { e.preventDefault(); if (hasTrip) setDragging(true) }}
        onDragOver={e => { e.preventDefault(); if (hasTrip) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); if (hasTrip) handleFiles(e.dataTransfer.files) }}
      >
        <i className="fa-solid fa-images dropzone-icon" />
        <p>拖放照片至此，或點擊上方按鈕上傳</p>
      </div>

      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <i className="fa-solid fa-camera" />
            <p>Day {activeDayIndex + 1} 尚無上傳照片，在此記錄精彩回憶！</p>
          </div>
        ) : photos.map(photo => (
          <div key={photo.id} className="photo-card" onClick={() => onOpenLightbox(photo)}>
            <img src={photo.data} alt="Travel memory" />
            <div className="photo-overlay">
              <span className="photo-meta">Day {photo.dayIndex + 1}</span>
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
    </section>
  )
}
