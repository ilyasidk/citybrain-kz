"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import type { Incident } from "@/lib/types";
import { CATEGORIES, STATUS_META } from "@/lib/categories";
import { ALMATY_CENTER } from "@/lib/geo";

type HeatFn = (
  points: [number, number, number][],
  options?: Record<string, unknown>,
) => L.Layer;

function HeatLayer({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    const points = incidents.map(
      (i) =>
        [i.lat, i.lng, 0.6 + Math.min(1, i.confirmations / 12)] as [number, number, number],
    );
    const heatLayer = (L as unknown as { heatLayer: HeatFn }).heatLayer(points, {
      radius: 36,
      blur: 28,
      maxZoom: 16,
      minOpacity: 0.35,
      max: 1.4,
      gradient: {
        0.15: "#1799c2",
        0.4: "#37c2a0",
        0.6: "#f0b120",
        0.8: "#f2622a",
        1: "#e21b1b",
      },
    });
    heatLayer.addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [incidents, map]);
  return null;
}

function makeIcon(incident: Incident): L.DivIcon {
  const c = CATEGORIES[incident.category];
  const faded = incident.status === "resolved" || incident.status === "rejected";
  const hot = incident.severity === "high" && !faded;
  return L.divIcon({
    className: "",
    html: `<div class="cb-wrap">${hot ? `<span class="cb-ping" style="background:${c.color}"></span>` : ""}<div class="cb-pin" style="background:${c.color};opacity:${faded ? 0.55 : 1}"><span>${c.emoji}</span></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
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
  mode = "markers",
}: {
  incidents: Incident[];
  center?: [number, number];
  zoom?: number;
  mode?: "markers" | "heat";
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

  const tileUrl =
    mode === "heat"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={initial}
      zoom={zoom}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key={mode}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={tileUrl}
      />
      <ZoomControl position="bottomleft" />
      {center && <Recenter center={initial} zoom={zoom} />}
      {mode === "heat" ? <HeatLayer incidents={incidents} /> : markers}
    </MapContainer>
  );
}
