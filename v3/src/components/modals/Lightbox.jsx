export default function Lightbox({ photo, onClose }) {
  if (!photo) return null
  return (
    <div className="modal lightbox-modal open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <span className="close-btn" onClick={onClose}>&times;</span>
      <div className="lightbox-content">
        <img src={photo.data} alt="Full Screen Photo" />
        <div className="lightbox-caption">
          <span>{photo.label || '旅遊相片'}</span>
        </div>
      </div>
    </div>
  )
}
