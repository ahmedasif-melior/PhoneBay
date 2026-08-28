"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";

import { Eyebrow } from "./ui";
import { inViewOnce, revealStagger, revealUp } from "./motion";

const supportingCards = [
  {
    icon: ShieldCheck,
    was: "A seller you can't verify",
    now: "ID-checked sellers",
    icon_tone: "text-[#6759E8]",
  },
  {
    icon: ClipboardCheck,
    was: "History that disappears at resale",
    now: "A full device passport",
    icon_tone: "text-[#0F9F86]",
  },
  {
    icon: LockKeyhole,
    was: "Payment before you can check the device",
    now: "Escrow-protected checkout",
    icon_tone: "text-[#6759E8]",
  },
];

export function ProblemValueSection() {
  return (
    <section className="bg-[#FCFCFD] py-24 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>More than a marketplace</Eyebrow>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
            Don&apos;t just trust the listing.
            <span className="block text-[#7567F8]">See the evidence.</span>
          </h2>

          <p className="mt-5 text-base leading-7 text-[#77727F]">
            PhoneBay is built around the problems people actually run into
            buying used phones — uncertain condition, hidden history,
            unreliable sellers and clunky verification.
          </p>
        </div>

        <motion.div
          variants={revealStagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-14 grid gap-5 lg:grid-cols-3 lg:grid-rows-2"
        >
          {/* Large featured card */}
          <motion.div
            variants={revealUp}
            className="relative overflow-hidden rounded-3xl border border-black/[0.055] bg-white p-8 shadow-[0_12px_40px_rgba(20,18,30,.04)] lg:col-span-2 lg:row-span-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7567F8]/[0.08] text-[#6759E8]">
              <Smartphone className="h-5 w-5" />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-[#17151F]">
              "Good condition" stops being a guess.
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#77727F]">
              Every listing can carry a real, tested condition score —
              measured, not claimed by the seller.
            </p>

            {/* Condition meter visual */}
            <div className="mt-8 rounded-2xl border border-black/[0.05] bg-[#FAFAFB] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#514D59]">Verified condition score</span>
                <span className="font-mono text-sm font-semibold text-[#0F9F86]">94/100</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[#7567F8] to-[#16C7A3]" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[#85818C] sm:grid-cols-4">
                <span>Battery · 91%</span>
                <span>Display · Pass</span>
                <span>Cameras · Pass</span>
                <span>Network · Pass</span>
              </div>
            </div>
          </motion.div>

          {/* Supporting cards */}
          {supportingCards.map((card) => (
            <motion.div
              key={card.now}
              variants={revealUp}
              className="rounded-3xl border border-black/[0.055] bg-white p-6 shadow-[0_12px_40px_rgba(20,18,30,.04)]"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.03] ${card.icon_tone}`}>
                <card.icon className="h-4 w-4" />
              </div>

              <p className="mt-4 text-xs text-[#A19CAA] line-through decoration-black/20">{card.was}</p>
              <p className="mt-1 text-sm font-semibold text-[#24212B]">{card.now}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}