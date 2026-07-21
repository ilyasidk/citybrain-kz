"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { ALMATY_CENTER } from "@/lib/geo";

const pinIcon = L.divIcon({
  className: "",
  html: `<div class="cb-pin" style="background:#0d5c63"><span>📍</span></div>`,
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
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
