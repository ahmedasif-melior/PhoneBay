import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SignalScore } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { phones } from "@/data/phones";

export const metadata: Metadata = { title: "Verification" };

export default function DashboardVerificationPage() {
  const device = phones[0];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink">Your Devices</h1>
      <p className="text-ink-soft mt-1">Request and track professional verification for your devices.</p>

      <Card className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="h-16 w-16 rounded-[--pb-radius-sm] bg-bg border border-border flex items-center justify-center shrink-0">
          <Image src={device.image} alt="" width={48} height={48} className="object-contain h-4/5 w-4/5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-ink">{device.model}</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-verify-dark bg-verify-tint rounded-full px-2.5 py-1">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          </div>
          <p className="text-sm text-ink-faint mt-1">Testing date: {formatDate("2026-08-27")}</p>
        </div>
        <SignalScore score={device.score} size="lg" />
      </Card>

      <div className="flex gap-3 mt-4">
        <Link href="/dashboard/certificates">
          <Button variant="outline">View Certificate</Button>
        </Link>
        <Link href="/dashboard/passport">
          <Button variant="outline">View Device Passport</Button>
        </Link>
      </div>

      <Card className="mt-8 flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-ink">Request verification for a new device</h3>
          <p className="text-sm text-ink-soft mt-1">
            Connect with a nearby PhoneBay partner shop for a free 12-point inspection.
          </p>
        </div>
        <Link href="/dashboard/listings/new" className="shrink-0">
          <Button>
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
