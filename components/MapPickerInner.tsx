"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { ALMATY_CENTER } from "@/lib/geo";

const pinIcon = L.divIcon({
  className: "",
  html: `<div class="cb-pin" style="background:#0c6a8d"><span>📍</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPickerInner({
  value,
  onChange,
}: {
  value: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[value.lat || ALMATY_CENTER.lat, value.lng || ALMATY_CENTER.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ClickHandler onChange={onChange} />
      <Marker
        position={[value.lat, value.lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend(e) {
            const m = e.target as L.Marker;
            const p = m.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      />
    </MapContainer>
  );
}
