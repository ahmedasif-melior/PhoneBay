import { ShoppingBag, Tag, ScanSearch, BookOpenCheck, Store, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: ShoppingBag,
    title: "Buy Phones",
    description: "Browse thousands of tested listings with transparent pricing and condition reports.",
  },
  {
    icon: Tag,
    title: "Sell Phones",
    description: "List in minutes and reach buyers who trust PhoneBay's verification standard.",
  },
  {
    icon: ScanSearch,
    title: "Verify Devices",
    description: "Get a professional 12-point technical inspection before you buy or sell.",
  },
  {
    icon: BookOpenCheck,
    title: "Device Passport",
    description: "A permanent record of testing, repairs, and ownership history for every device.",
  },
  {
    icon: Store,
    title: "Trusted Shops",
    description: "Work with verified local shops for testing, repairs, and in-person handovers.",
  },
  {
    icon: Wrench,
    title: "Repairs",
    description: "Certified repair partners keep your device passport accurate and up to date.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((f) => (
        <Card key={f.title} hoverable className="flex flex-col gap-4">
          <span className="h-11 w-11 rounded-[var(--pb-radius-sm)] bg-brand-tint text-brand flex items-center justify-center">
            <f.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="font-semibold text-ink text-[17px]">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{f.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
