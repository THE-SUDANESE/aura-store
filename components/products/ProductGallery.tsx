"use client";

import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-sand-100">
        <img
          key={activeImage}
          src={activeImage}
          alt={alt}
          width={800}
          height={1000}
          className="aspect-[4/5] w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`عرض الصورة ${index + 1} من ${images.length}`}
                aria-pressed={isActive}
                className={`overflow-hidden rounded-2xl border bg-sand-100 transition ${
                  isActive
                    ? "border-ink-900 ring-1 ring-ink-900"
                    : "border-ink-100 hover:border-ink-300"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
