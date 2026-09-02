import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <Image
        src={dark ? "/images/brand/phonebay-logo-dark.svg" : "/images/brand/phonebay-logo.svg"}
        alt="PhoneBay"
        width={1000}
        height={300}
        priority
        className="h-12 w-auto"
      />
    </span>
  );
}
