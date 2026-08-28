import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <Image
        src="/images/brand/phonebay-logo.svg"
        alt="PhoneBay"
        width={1000}
        height={300}
        priority
        className={cn("h-12 w-auto", dark && "brightness-0 invert")}
      />
    </span>
  );
}
