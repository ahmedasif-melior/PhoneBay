"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldCheck, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/navigation/Logo";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/verification", label: "Verification" },
  { href: "/for-sellers", label: "For Sellers" },
  { href: "/for-shops", label: "For Shops" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-black/[0.06]
        bg-[#FCFCFD]/85
        backdrop-blur-xl
        supports-[backdrop-filter]:bg-[#FCFCFD]/75
      "
    >
      {/* Very subtle brand glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute left-1/2 top-0
          h-px w-48
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-[#7567F8]/60
          to-transparent
        "
      />

      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            LOGO
        ===================================================== */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2"
          aria-label="PhoneBay home"
        >
              <Logo />
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  `
                    relative
                    rounded-xl
                    px-3.5 py-2
                    text-[13px]
                    font-medium
                    transition-all
                    duration-200
                  `,
                  active
                    ? "text-[#5147C7]"
                    : "text-[#6B6875] hover:bg-black/[0.025] hover:text-[#17151F]"
                )}
              >
                {link.label}

                {/* Active indicator */}
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="
                      absolute
                      bottom-0.5
                      left-1/2
                      h-1
                      w-1
                      -translate-x-1/2
                      rounded-full
                      bg-[#7567F8]
                    "
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            href="/auth/signin"
            variant="ghost"
            size="sm"
            className="
              text-[#5F5B68]
              hover:bg-black/[0.035]
              hover:text-[#17151F]
            "
          >
            Sign In
          </Button>

          <Link
            href="/dashboard/listings/create"
            className="
              group
              relative
              inline-flex
              h-9
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-xl
              bg-gradient-to-r
              from-[#7567F8]
              via-[#765BEA]
              to-[#16BFA0]
              px-4
              text-[13px]
              font-semibold
              text-white
              shadow-[0_6px_20px_rgba(108,99,255,0.20)]
              transition-all
              duration-300
              hover:-translate-y-px
              hover:shadow-[0_8px_25px_rgba(108,99,255,0.28)]
            "
          >
            {/* Shine */}
            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/15
                to-transparent
                transition-transform
                duration-700
                group-hover:translate-x-full
              "
            />

            <span className="relative">Sell Your Phone</span>

            <ArrowUpRight
              className="
                relative
                h-3.5
                w-3.5
                transition-transform
                duration-200
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />
          </Link>
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}
        <button
          type="button"
          className="
            flex
            h-10 w-10
            items-center justify-center
            rounded-xl
            border border-black/[0.06]
            bg-white/70
            text-[#27242D]
            transition-all
            hover:border-black/[0.10]
            hover:bg-white
            lg:hidden
          "
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="h-[19px] w-[19px]" />
        </button>
      </div>

      {/* =======================================================
          MOBILE MENU
      ======================================================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="
                fixed
                inset-0
                z-40
                bg-[#0D0D12]/35
                backdrop-blur-[2px]
                lg:hidden
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="
                fixed
                right-0
                top-0
                z-50
                flex
                h-full
                w-[88%]
                max-w-sm
                flex-col
                border-l
                border-black/[0.06]
                bg-[#FCFCFD]
                shadow-[-20px_0_70px_rgba(13,13,18,0.10)]
                lg:hidden
              "
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              {/* Mobile header */}
              <div className="flex h-[68px] items-center justify-between border-b border-black/[0.06] px-5">
                <Link
                  href="/"
                  className="flex items-center"
                  aria-label="PhoneBay home"
                >
                  <Logo />
                </Link>

                <button
                  type="button"
                  className="
                    flex
                    h-10 w-10
                    items-center justify-center
                    rounded-xl
                    border border-black/[0.06]
                    bg-white
                    text-[#27242D]
                    transition-colors
                    hover:bg-[#F7F6FA]
                  "
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-[19px] w-[19px]" />
                </button>
              </div>

              {/* Mobile navigation */}
              <nav
                className="flex flex-col gap-1.5 p-5"
                aria-label="Mobile primary"
              >
                {links.map((link) => {
                  const active = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        `
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          px-4 py-3.5
                          text-[15px]
                          font-medium
                          transition-all
                        `,
                        active
                          ? "bg-[#7567F8]/[0.08] text-[#5147C7]"
                          : "text-[#5F5B68] hover:bg-black/[0.025] hover:text-[#17151F]"
                      )}
                    >
                      <span>{link.label}</span>

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7567F8]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile bottom area */}
              <div className="mt-auto border-t border-black/[0.06] p-5">
                {/* Trust message */}
                <div
                  className="
                    mb-5
                    rounded-2xl
                    border
                    border-[#16BFA0]/15
                    bg-[#16BFA0]/[0.045]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex
                        h-9 w-9
                        shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-[#16BFA0]/10
                        text-[#0F9F86]
                      "
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-[#17151F]">
                        Built around trust
                      </div>

                      <p className="mt-1 text-[11px] leading-5 text-[#77727F]">
                        Verified sellers, tested devices, and transparent
                        history.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Button
                    href="/auth/signin"
                    variant="outline"
                    fullWidth
                    className="
                      border-black/[0.08]
                      bg-white
                      text-[#3F3B46]
                      hover:bg-[#F7F6FA]
                    "
                  >
                    Sign In
                  </Button>

                  <Link
                    href="/dashboard/listings/create"
                    className="
                      group
                      relative
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-xl
                      bg-gradient-to-r
                      from-[#7567F8]
                      via-[#765BEA]
                      to-[#16BFA0]
                      text-sm
                      font-semibold
                      text-white
                      shadow-[0_8px_25px_rgba(108,99,255,0.20)]
                    "
                  >
                    <span className="relative">Sell Your Phone</span>

                    <ArrowUpRight
                      className="
                        relative
                        h-4
                        w-4
                        transition-transform
                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}