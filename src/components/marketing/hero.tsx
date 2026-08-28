"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck, LockKeyhole, ShieldCheck } from "lucide-react";

import HeroProductSlider from "@/components/marketing/HeroProductSlider";
import { fadeUp, stagger } from "./motion";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0D0D12] py-24">
      {/* Ambient gradients */}
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-20%] top-[-30%] aspect-square w-[50%] rounded-full bg-[#9B3CFF]/12 blur-[170px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-35%] -translate-x-1/2 aspect-square w-[45%] rounded-full bg-[#FF4FD8]/10 blur-[180px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-20%] top-[-25%] aspect-square w-[50%] rounded-full bg-[#553CFF]/12 blur-[170px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-20%] bottom-[-30%] aspect-square w-[50%] rounded-full bg-[#16C7A3]/10 blur-[170px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 bottom-[-35%] -translate-x-1/2 aspect-square w-[45%] rounded-full bg-[#24D9FF]/8 blur-[180px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-20%] bottom-[-30%] aspect-square w-[50%] rounded-full bg-[#10B981]/10 blur-[170px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.035]"
        />
      </>

      <div className="relative z-10 mx-auto w-[90%] max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          {/* Hero copy */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs font-medium text-white/75 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16C7A3]" />
                A safer way to buy and sell phones
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 max-w-[720px] text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-[64px] lg:leading-[1.02]"
            >
              Buy and sell phones
              <span className="block bg-gradient-to-r from-[#B59CFF] via-[#8B7CFF] to-[#42E6C2] bg-clip-text text-transparent">
                with confidence.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              PhoneBay brings buyers, sellers, trusted shops and repair
              experts together — with device testing, verification,
              history and protected transactions built into the experience.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/marketplace"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7567F8] via-[#765BEA] to-[#16BFA0] px-5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(108,99,255,.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(108,99,255,.35)]"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-white/85 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-white"
              >
                How It Works
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/45"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#16C7A3]" />
                Verified sellers
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#9B8DFF]" />
                Device testing
              </div>
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-[#42E6C2]" />
                Protected transactions
              </div>
            </motion.div>
          </motion.div>

          {/* Hero product visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative flex justify-end"
          >
            <HeroProductSlider />
          </motion.div>
        </div>
      </div>
    </section>
  );
}