import Link from "next/link";
import { ShieldCheck, BadgeCheck, ScanLine } from "lucide-react";
import { Logo } from "@/components/navigation/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-10 xl:p-14 relative overflow-hidden">
        <Link href="/" className="max-w-max">
          <Logo dark />
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-3xl xl:text-4xl font-semibold leading-tight">
            Buy. Sell. Verify.
          </h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            Join a marketplace where every device's condition is tested, every seller is
            accountable, and every transaction is protected.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              [ShieldCheck, "Professional device verification"],
              [BadgeCheck, "Trusted, verified sellers"],
              [ScanLine, "Transparent device history"],
            ].map(([Icon, label], i) => {
              const IconComp = Icon as React.ElementType;
              return (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <IconComp className="h-4 w-4" />
                  </span>
                  {label as string}
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/40">© 2026 PhoneBay. All rights reserved.</p>

        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex justify-center mb-8">
            <Logo />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
