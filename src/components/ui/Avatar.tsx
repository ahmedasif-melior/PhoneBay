import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  if (src) {
    const px = { sm: 32, md: 40, lg: 56, xl: 80 }[size];
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={cn("rounded-full object-cover border border-border", sizeMap[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "rounded-full bg-brand-tint text-brand-dark font-semibold flex items-center justify-center border border-border shrink-0",
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
