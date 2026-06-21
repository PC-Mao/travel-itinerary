import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon path broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

export default function MapView({ places, onMapClick }) {
  const validPlaces = places.filter(p => p.lat && p.lng)
  const center = validPlaces.length > 0
    ? [validPlaces[0].lat, validPlaces[0].lng]
    : [25.0330, 121.5654] // default: Taipei

  return (
    <MapContainer center={center} zoom={13} className="w-full h-64 rounded-xl z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      {validPlaces.map((p, i) => (
        <Marker key={p.id} position={[p.lat, p.lng]}>
          <Popup>
            <strong>{i + 1}. {p.name}</strong>
            {p.time && <><br />{p.time}</>}
            {p.note && <><br />{p.note}</>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
