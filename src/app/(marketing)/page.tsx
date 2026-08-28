"use client";

import Link from "next/link";
import { type Variants, motion } from "framer-motion";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  LockKeyhole,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Wrench,
} from "lucide-react";
import HeroProductSlider from "@/components/marketing/HeroProductSlider";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CertificatePreview, TestReportPreview } from "@/components/marketing/TestReportPreview";
import { PassportPreview } from "@/components/marketing/PassportPreview";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { Hero } from "@/components/marketing/hero";
import { ProblemValueSection } from "@/components/marketing/Problemvaluesection";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut",
    },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#FCFCFD] text-[#17151F]">
      <Hero />
      <TrustStrip />
<ProblemValueSection />
      {/* =========================================================
          PROBLEM / VALUE
      ========================================================= */}
      <section className="bg-[#FCFCFD] py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7567F8]">
              More than a marketplace
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
              Don't just trust the listing.
              <span className="block text-[#7567F8]">
                See the evidence.
              </span>
            </h2>

            <p className="mt-5 text-base leading-7 text-[#77727F]">
              PhoneBay is designed around the problems people face when
              buying used phones — uncertain condition, hidden history,
              unreliable sellers and difficult verification.
            </p>
          </div>

          <div className="mt-14">
            <FeatureGrid />
          </div>
        </div>
      </section>

      {/* =========================================================
          VERIFICATION
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F5F3FA] py-24 sm:py-28">
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute left-[-10%] top-[-20%]
            h-[420px] w-[420px] rounded-full
            bg-[#9B3CFF]/[0.07] blur-[130px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute bottom-[-20%] right-[-10%]
            h-[420px] w-[420px] rounded-full
            bg-[#16C7A3]/[0.07] blur-[130px]
          "
        />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6355DC] shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" />
                PhoneBay Verified
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
                Turn a phone listing into a{" "}
                <span className="text-[#7567F8]">verified record.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#77727F]">
                Buyers should not have to guess. Verified shops can inspect
                devices and create a structured report covering condition,
                battery health, display, cameras, connectivity and other
                important checks.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Structured device testing",
                  "Shop or brand verification",
                  "Performance score",
                  "Visible verification status",
                  "Test date and report history",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#514D59]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#10A98D]" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/verification"
                className="
                  mt-8 inline-flex items-center gap-2
                  text-sm font-semibold text-[#6355DC]
                  transition-colors hover:text-[#16A88E]
                "
              >
                Explore verification
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <TestReportPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CERTIFICATE
      ========================================================= */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <CertificatePreview />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#10A98D]">
                Device certificate
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
                Give every verified phone a{" "}
                <span className="text-[#7567F8]">proof of condition.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#77727F]">
                A certificate gives buyers a clear snapshot of what was tested,
                when it was tested and who verified it.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Health score",
                  "Battery status",
                  "Display test",
                  "Camera test",
                  "Network checks",
                  "Verification date",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      flex items-center gap-2.5
                      rounded-xl border border-black/[0.055]
                      bg-[#FCFCFD] px-3.5 py-3
                      text-xs font-medium text-[#514D59]
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16C7A3]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DEVICE PASSPORT
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#0D0D12] py-24 sm:py-28">
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute left-[-15%] top-[15%]
            h-[500px] w-[500px] rounded-full
            bg-[#553CFF]/10 blur-[150px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute right-[-15%] bottom-[-10%]
            h-[500px] w-[500px] rounded-full
            bg-[#16C7A3]/10 blur-[150px]
          "
        />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#42E6C2]">
                Device Passport
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                A phone's story shouldn't{" "}
                <span className="text-[#9F93FF]">disappear.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
                Build a persistent history around the device — testing,
                ownership events, service records and verification reports.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: ClipboardCheck,
                    title: "Testing history",
                    text: "Keep previous inspection results.",
                  },
                  {
                    icon: Wrench,
                    title: "Repair records",
                    text: "Track verified service information.",
                  },
                  {
                    icon: PackageCheck,
                    title: "Ownership journey",
                    text: "Create more transparency across resale.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#9F93FF]">
                      <item.icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <PassportPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BUYER FLOW
      ========================================================= */}
      <section className="bg-[#FCFCFD] py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7567F8]">
              Simple for buyers
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
              Find it. Verify it. Buy it.
            </h2>

            <p className="mt-5 text-base leading-7 text-[#77727F]">
              The experience should feel as easy as any marketplace — with
              more information behind the transaction.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: Search,
                title: "Find the right phone",
                text: "Search by model, condition, price, region and seller type.",
              },
              {
                number: "02",
                icon: BadgeCheck,
                title: "Check the evidence",
                text: "Review testing, certificate, history and seller verification.",
              },
              {
                number: "03",
                icon: LockKeyhole,
                title: "Buy with confidence",
                text: "Use safer transaction and delivery options where available.",
              },
            ].map((item) => (
              <motion.div
                key={item.number}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="
                  relative rounded-3xl
                  border border-black/[0.055]
                  bg-white p-7
                  shadow-[0_12px_40px_rgba(20,18,30,.04)]
                "
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7567F8]/[0.08] text-[#6759E8]">
                    <item.icon className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-semibold text-black/20">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-semibold text-[#24212B]">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#77727F]">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SHOPS
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F4F2F8] py-24 sm:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16C7A3]/10 text-[#0F9F86]">
                <Store className="h-5 w-5" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#10A98D]">
                For trusted shops
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#17151F] sm:text-4xl">
                Turn your expertise into{" "}
                <span className="text-[#7567F8]">trust.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#77727F]">
                Phone shops and repair businesses can become verified service
                partners, test devices, issue reports and reach nearby buyers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/for-shops"
                  className="
                    inline-flex h-11 items-center gap-2 rounded-xl
                    bg-[#17151F] px-4 text-sm font-semibold text-white
                    transition hover:bg-[#292630]
                  "
                >
                  Become a verified shop
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/shops"
                  className="
                    inline-flex h-11 items-center gap-2 rounded-xl
                    border border-black/[0.07] bg-white
                    px-4 text-sm font-semibold text-[#4C4853]
                    transition hover:bg-[#FAFAFB]
                  "
                >
                  Find a shop
                </Link>
              </div>
            </div>

            <div>
              {/* <NearbyShops /> */}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SELLER CTA
      ========================================================= */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
          <div
            className="
              relative overflow-hidden rounded-[32px]
              bg-[#0D0D12] px-7 py-12 text-center
              shadow-[0_25px_80px_rgba(20,18,30,.12)]
              sm:px-12 sm:py-16
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute left-[-15%] top-[-50%]
                h-[420px] w-[420px] rounded-full
                bg-[#9B3CFF]/15 blur-[130px]
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute right-[-15%] bottom-[-50%]
                h-[420px] w-[420px] rounded-full
                bg-[#16C7A3]/12 blur-[130px]
              "
            />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#42E6C2]">
                Sell smarter
              </p>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Ready to list your next phone?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">
                Create a detailed listing, build buyer confidence and connect
                with people looking for your device.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard/listings/create"
                  className="
                    inline-flex h-12 items-center justify-center gap-2
                    rounded-xl px-5 text-sm font-semibold text-white
                    bg-gradient-to-r from-[#7567F8] via-[#765BEA] to-[#16C7A3]
                    shadow-[0_10px_35px_rgba(108,99,255,.25)]
                    transition hover:-translate-y-0.5
                  "
                >
                  Sell Your Phone
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/marketplace"
                  className="
                    inline-flex h-12 items-center justify-center gap-2
                    rounded-xl border border-white/10 bg-white/[0.04]
                    px-5 text-sm font-semibold text-white/80
                    transition hover:bg-white/[0.08] hover:text-white
                  "
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL TRUST STATEMENT
      ========================================================= */}
      <section className="border-t border-black/[0.055] bg-[#FCFCFD] py-10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2 text-xs text-[#85818C]">
            <ShieldCheck className="h-4 w-4 text-[#10A98D]" />
            Built around transparency, verification and better transactions.
          </div>

          <Link
            href="/how-it-works"
            className="flex items-center gap-1 text-xs font-semibold text-[#6355DC] hover:text-[#5147C7]"
          >
            Learn how PhoneBay works
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}