"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Incident } from "@/lib/types";
import { CATEGORIES, STATUS_META } from "@/lib/categories";
import { ALMATY_CENTER } from "@/lib/geo";

function makeIcon(incident: Incident): L.DivIcon {
  const c = CATEGORIES[incident.category];
  const faded = incident.status === "resolved" || incident.status === "rejected";
  return L.divIcon({
    className: "",
    html: `<div class="cb-pin" style="background:${c.color};opacity:${faded ? 0.55 : 1}"><span>${c.emoji}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapInner({
  incidents,
  center,
  zoom = 12,
}: {
  incidents: Incident[];
  center?: [number, number];
  zoom?: number;
}) {
  const initial: [number, number] = center ?? [ALMATY_CENTER.lat, ALMATY_CENTER.lng];
  const markers = useMemo(
    () =>
      incidents.map((i) => (
        <Marker key={i.id} position={[i.lat, i.lng]} icon={makeIcon(i)}>
          <Popup>
            <div className="min-w-[180px]">
              <div className="mb-1 text-xs font-semibold" style={{ color: CATEGORIES[i.category].color }}>
                {CATEGORIES[i.category].emoji} {CATEGORIES[i.category].label}
              </div>
              <div className="mb-1 text-sm font-medium text-slate-900">{i.title}</div>
              <div className="mb-2 text-xs text-slate-500">
                {STATUS_META[i.status].label} · {i.confirmations} подтв. · {i.district}
              </div>
              <Link
                href={`/incident/${i.id}`}
                className="text-xs font-semibold text-brand underline"
              >
                Открыть карточку →
              </Link>
            </div>
          </Popup>
        </Marker>
      )),
    [incidents],
  );

  return (
    <MapContainer center={initial} zoom={zoom} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <Recenter center={initial} zoom={zoom} />}
      {markers}
    </MapContainer>
  );
}
