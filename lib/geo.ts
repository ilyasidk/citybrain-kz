export const ALMATY_CENTER = { lat: 43.238949, lng: 76.889709 };

export interface SensitiveObject {
  name: string;
  type: "school" | "hospital" | "playground";
  lat: number;
  lng: number;
}

// Небольшой набор чувствительных объектов Алматы для скоринга приоритета.
export const SENSITIVE_OBJECTS: SensitiveObject[] = [
  { name: "Школа №25", type: "school", lat: 43.2405, lng: 76.9155 },
  { name: "Школа №128", type: "school", lat: 43.2201, lng: 76.8512 },
  { name: "Городская больница №7", type: "hospital", lat: 43.2560, lng: 76.9280 },
  { name: "ГКБ №4", type: "hospital", lat: 43.2312, lng: 76.8402 },
  { name: "Детская площадка «Достык»", type: "playground", lat: 43.2455, lng: 76.9560 },
  { name: "Детский сад №15", type: "school", lat: 43.2115, lng: 76.8705 },
  { name: "Поликлиника №6", type: "hospital", lat: 43.2680, lng: 76.9345 },
  { name: "Детская площадка «Алатау»", type: "playground", lat: 43.2020, lng: 76.8890 },
];

export const DISTRICTS = [
  "Алмалинский",
  "Бостандыкский",
  "Медеуский",
  "Ауэзовский",
  "Наурызбайский",
  "Турксибский",
  "Жетысуский",
  "Алатауский",
];

const EARTH_RADIUS_M = 6371000;

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function nearestSensitive(point: { lat: number; lng: number }): {
  object: SensitiveObject;
  distance: number;
} | null {
  let best: { object: SensitiveObject; distance: number } | null = null;
  for (const obj of SENSITIVE_OBJECTS) {
    const distance = haversineMeters(point, obj);
    if (!best || distance < best.distance) best = { object: obj, distance };
  }
  return best;
}

// Грубое определение района по координатам (для сид-данных достаточно).
export function districtForPoint(point: { lat: number; lng: number }): string {
  const idx =
    (Math.abs(Math.round(point.lat * 1000)) +
      Math.abs(Math.round(point.lng * 1000))) %
    DISTRICTS.length;
  return DISTRICTS[idx];
}
