import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { TestReportPreview, CertificatePreview } from "@/components/marketing/TestReportPreview";
import { PassportPreview } from "@/components/marketing/PassportPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Monitor, Hand, Camera, Volume2, Mic, BatteryCharging, Wifi, Bluetooth, MapPin, Sliders, ScanFace, ToggleLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Verification",
  description: "How PhoneBay's professional device verification and 12-point testing works.",
};

const checkpoints = [
  { icon: Monitor, label: "Display" },
  { icon: Hand, label: "Touch" },
  { icon: ScanFace, label: "Face ID" },
  { icon: Camera, label: "Camera" },
  { icon: Camera, label: "Front Camera" },
  { icon: Volume2, label: "Speaker" },
  { icon: Mic, label: "Microphone" },
  { icon: BatteryCharging, label: "Charging" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Bluetooth, label: "Bluetooth" },
  { icon: MapPin, label: "GPS" },
  { icon: ToggleLeft, label: "Buttons" },
];

export default function VerificationPage() {
  return (
    <>
      <Section className="pt-14 pb-10">
        <SectionHeading
          eyebrow="Verification"
          title="Trust that's tested, not just claimed."
          description="Every verified device on PhoneBay passes a 12-point technical inspection performed by a certified partner shop."
        />
      </Section>

      <Section bg="surface">
        <h2 className="text-2xl font-semibold text-ink mb-8">The 12-point checklist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {checkpoints.map((c) => (
            <Card key={c.label} className="text-center py-6">
              <c.icon className="h-6 w-6 text-brand mx-auto mb-2.5" strokeWidth={1.7} />
              <p className="text-sm font-medium text-ink">{c.label}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <TestReportPreview />
          <div>
            <SectionHeading
              eyebrow="Testing report"
              title="A score you can compare, at a glance."
              description="Each device receives a signal-style score from 0–10, calculated from its condition across every checkpoint."
            />
          </div>
        </div>
      </Section>

      <Section bg="surface">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <SectionHeading
              eyebrow="Certificate"
              title="Proof that travels with the device."
              description="A shareable digital certificate is issued after testing, valid for 30 days and verifiable by anyone with the link."
            />
            <Button href="/dashboard/certificates" variant="outline" className="mt-5">
              View a sample certificate
            </Button>
          </div>
          <CertificatePreview />
        </div>
      </Section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <SectionHeading
              eyebrow="Device passport"
              title="Every event, permanently recorded."
              description="Testing, repairs, and resale events build a permanent record that follows the device, not just the listing."
            />
          </div>
          <PassportPreview />
        </div>
      </Section>

      <Section bg="surface" className="text-center">
        <Sliders className="h-8 w-8 text-brand mx-auto mb-4" />
        <h2 className="text-3xl font-semibold text-ink">Want your device verified?</h2>
        <p className="text-ink-soft mt-2">Request verification from your dashboard in a few taps.</p>
        <Button href="/dashboard/verification" size="lg" className="mt-6">
          Request Verification
        </Button>
      </Section>
    </>
  );
}
