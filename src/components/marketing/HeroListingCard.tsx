"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, BatteryFull, BadgeCheck, ScanLine } from "lucide-react";
import { SignalScore } from "@/components/ui/Rating";

export function HeroListingCard() {
  return (
    <div className="relative w-full max-w-md mx-auto" aria-hidden="true">
      {/* Main listing card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-surface rounded-[var(--pb-radius-lg)] border border-border shadow-[var(--pb-shadow-lg)] p-5 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Professionally Verified
          </span>
          <SignalScore score={9.1} size="sm" />
        </div>

        <div className="flex gap-4">
          <div className="h-24 w-24 rounded-[var(--pb-radius-md)] bg-bg border border-border shrink-0 overflow-hidden flex items-center justify-center">
            <Image
              src="/images/phones/iphone-15-pro.svg"
              alt=""
              width={96}
              height={96}
              className="object-contain h-full w-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-ink leading-tight">
              iPhone 15 Pro
            </h3>
            <p className="text-sm text-ink-faint">256GB · Natural Titanium</p>
            <p className="mt-2 font-data text-xl font-semibold text-ink">Rs. 150,000</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-ink-faint mb-1">Battery Health</p>
            <div className="flex items-center gap-1.5">
              <BatteryFull className="h-4 w-4 text-verify" />
              <span className="text-sm font-medium text-ink">91%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-1">Seller</p>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium text-ink">Verified Seller</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating badge: Device Tested */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="absolute -left-6 sm:-left-10 top-8 bg-surface border border-border rounded-[var(--pb-radius-md)] shadow-[var(--pb-shadow-md)] px-3.5 py-2.5 flex items-center gap-2 z-20"
      >
        <ScanLine className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium text-ink">Device Tested</span>
      </motion.div>

      {/* Floating badge: Seller Verified */}
      <motion.div
        initial={{ opacity: 0, x: 16, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
        className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 bg-surface border border-border rounded-[var(--pb-radius-md)] shadow-[var(--pb-shadow-md)] px-3.5 py-2.5 flex items-center gap-2 z-20"
      >
        <BadgeCheck className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium text-ink">Seller Verified</span>
      </motion.div>

      {/* Floating badge: Certificate Active */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
        className="absolute -bottom-6 left-8 bg-surface border border-border rounded-[var(--pb-radius-md)] shadow-[var(--pb-shadow-md)] px-3.5 py-2.5 flex items-center gap-2 z-20"
      >
        <ShieldCheck className="h-4 w-4 text-verify" />
        <span className="text-xs font-medium text-ink">Certificate Active</span>
      </motion.div>

      {/* Ambient backdrop shape */}
      <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 bg-brand-tint rounded-[var(--pb-radius-lg)]" />
    </div>
  );
}
