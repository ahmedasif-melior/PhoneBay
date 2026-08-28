import { ClipboardCheck, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { DataTag } from "./ui";

const items = [
  {
    code: "SEL-ID",
    icon: ShieldCheck,
    title: "Verified sellers",
    text: "Identity and history checked before they can list.",
  },
  {
    code: "DEV-QC",
    icon: Smartphone,
    title: "Tested devices",
    text: "Battery, display, camera and network checked pre-sale.",
  },
  {
    code: "HIST",
    icon: ClipboardCheck,
    title: "Full device history",
    text: "Ownership, repairs and past tests in one record.",
  },
  {
    code: "PAY-SAFE",
    icon: LockKeyhole,
    title: "Protected payments",
    text: "Funds held until you confirm the device matches.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-b border-black/[0.055] bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 divide-y divide-black/[0.055] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.code} className="group flex items-start gap-3 px-5 py-6 sm:px-6">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7567F8]/[0.07] text-[#6759E8] transition-colors group-hover:bg-[#7567F8]/[0.12]">
              <item.icon className="h-4 w-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[#24212B]">{item.title}</p>
                <DataTag>{item.code}</DataTag>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-[#85818C]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}