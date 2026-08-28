"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PhoneGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = React.useState(0);
  return (
    <div>
      <div className="aspect-square bg-bg rounded-[var(--pb-radius-lg)] border border-border flex items-center justify-center overflow-hidden">
        <Image
          src={images[active]}
          alt={alt}
          width={420}
          height={420}
          className="object-contain h-4/5 w-4/5"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                "h-16 w-16 rounded-[var(--pb-radius-sm)] border-2 bg-bg flex items-center justify-center overflow-hidden shrink-0",
                active === i ? "border-brand" : "border-transparent"
              )}
            >
              <Image src={img} alt="" width={56} height={56} className="object-contain h-4/5 w-4/5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
