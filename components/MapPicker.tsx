"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#dfe6ea] text-sm text-muted">
      Загрузка карты…
    </div>
  ),
});

export default function MapPicker(props: {
  value: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
}) {
  return <Inner {...props} />;
}
