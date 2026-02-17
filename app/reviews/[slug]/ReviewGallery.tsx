"use client";

import { useState } from "react";

export default function ReviewGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden mb-3 bg-[var(--bg-off)]" style={{ aspectRatio: "1" }}>
        <img src={images[selected]} alt="" className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="flex-1 p-0 border-2 cursor-pointer overflow-hidden bg-[var(--bg-off)]"
              style={{ aspectRatio: "1", borderColor: i === selected ? "var(--gold)" : "transparent", opacity: i === selected ? 1 : 0.6 }}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
