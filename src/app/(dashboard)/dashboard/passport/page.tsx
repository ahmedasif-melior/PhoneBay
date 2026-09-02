import type { Metadata } from "next";
import { PassportTimeline } from "@/components/verification/PassportTimeline";
import { passportTimeline } from "@/data/verification";

export const metadata: Metadata = { title: "Device Passport" };

export default function DevicePassportPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Device Passport</h1>
      <p className="text-ink-soft mt-1 mb-8">iPhone 15 Pro — full history</p>
      <PassportTimeline events={passportTimeline} device="your iPhone 15 Pro" />
    </div>
  );
}
