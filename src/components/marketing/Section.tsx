import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  bg,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: "surface" | "bg" | "ink";
  id?: string;
}) {
  const bgClass =
    bg === "surface" ? "bg-surface" : bg === "ink" ? "bg-ink text-white" : "bg-bg";
  return (
    <section id={id} className={cn(bgClass, "py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "verify" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold tracking-wide uppercase rounded-full px-3 py-1",
        tone === "brand" ? "bg-brand-tint text-brand-dark" : "bg-verify-tint text-verify-dark"
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-ink">{title}</h2>
      {description && <p className="mt-3 text-lg text-ink-soft leading-relaxed">{description}</p>}
    </div>
  );
}
