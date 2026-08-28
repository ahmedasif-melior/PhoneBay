import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  padded = true,
  hoverable = false,
  as: Comp = "div",
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
  hoverable?: boolean;
  as?: React.ElementType;
}) {
  return (
    <Comp
      className={cn(
        "bg-surface border border-border rounded-[var(--pb-radius-md)]",
        padded && "p-5",
        hoverable &&
          "transition-all duration-200 hover:border-border-strong hover:shadow-[var(--pb-shadow-md)] hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </Comp>
  );
}
