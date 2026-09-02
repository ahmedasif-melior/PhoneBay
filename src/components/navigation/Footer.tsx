import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/navigation/Logo";

const socials = ["fb", "ig", "x"];

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace", label: "Browse Phones" },
      { href: "/dashboard/listings/new", label: "Sell Your Phone" },
      { href: "/for-shops", label: "For Shops" },
      { href: "/verification", label: "Verification" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/for-sellers", label: "For Sellers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Help Centre" },
      { href: "/contact", label: "Report a Listing" },
      { href: "/contact", label: "Buyer Protection" },
      { href: "/contact", label: "Seller Guidelines" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-ink-soft max-w-xs leading-relaxed">
              A trusted marketplace for buying and selling phones with professional
              verification, transparent device history, and trusted sellers.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              12,800+ verified transactions
            </div>
            <div className="flex items-center gap-2.5 mt-6">
              {socials.map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={`PhoneBay on social (${s})`}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-xs font-medium text-ink-faint hover:text-ink hover:border-ink-faint uppercase"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-ink mb-3.5">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link, i) => (
                  <li key={col.title + i}>
                    <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-faint">
            © 2026 PhoneBay. All rights reserved. Available in Pakistan, expanding internationally.
          </p>
          <div className="flex items-center gap-5 text-xs text-ink-faint">
            <Link href="/contact" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-ink">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
