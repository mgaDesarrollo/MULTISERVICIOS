"use client"
import { useState } from "react"

export default function ProductGallery({ images, title, heightClass }: { images: string[]; title: string; heightClass?: string }) {
  const safe = (Array.isArray(images) && images.length ? images : ["/placeholder.svg"]).slice(0, 4)
  const [idx, setIdx] = useState(0)
  const current = safe[Math.min(idx, safe.length - 1)]
  const mainH = heightClass || "h-80"
  return (
    <div>
  <div className={`w-full ${mainH} bg-white flex items-center justify-center rounded-md mb-3`}>
        <img src={current} alt={title} className="max-w-full max-h-full object-contain" />
      </div>
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {safe.map((src, i) => (
            <button
              key={i}
              className={`border rounded p-1 ${i === idx ? "border-primary" : "border-transparent"}`}
              onClick={() => setIdx(i)}
            >
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded">
                <img src={src} alt={`thumb-${i}`} className="max-w-full max-h-full object-contain" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
