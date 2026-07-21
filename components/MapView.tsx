"use client";

import dynamic from "next/dynamic";
import type { Incident } from "@/lib/types";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#dfe6ea] text-sm text-muted">
      Загрузка карты…
    </div>
  ),
});

export default function MapView(props: {
  incidents: Incident[];
  center?: [number, number];
  zoom?: number;
}) {
  return <MapInner {...props} />;
}
