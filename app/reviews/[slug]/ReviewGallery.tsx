"use client";

import { useState } from "react";
import Image from "next/image";

export default function ReviewGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative overflow-hidden mb-3 bg-[var(--bg-off)]" style={{ aspectRatio: "1" }}>
        <Image src={images[selected]} alt="Review gallery image" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="relative flex-1 p-0 border-2 cursor-pointer overflow-hidden bg-[var(--bg-off)]"
              style={{ aspectRatio: "1", borderColor: i === selected ? "var(--gold)" : "transparent", opacity: i === selected ? 1 : 0.6 }}>
              <Image src={img} alt="Review thumbnail" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
