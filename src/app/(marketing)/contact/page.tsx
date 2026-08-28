import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the PhoneBay team.",
};

export default function ContactPage() {
  return (
    <Section className="pt-14">
      <SectionHeading
        eyebrow="Contact"
        title="We're here to help."
        description="Reach out about listings, verification, partnerships, or anything else."
      />

      <div className="mt-10 grid lg:grid-cols-[1fr_400px] gap-8">
        <Card className="p-7">
          <ContactForm />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex items-start gap-3.5">
            <Mail className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink text-sm">Email</p>
              <p className="text-sm text-ink-soft">support@phonebay.com</p>
            </div>
          </Card>
          <Card className="flex items-start gap-3.5">
            <Phone className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink text-sm">Phone</p>
              <p className="text-sm text-ink-soft">+92 51 111 000 111</p>
            </div>
          </Card>
          <Card className="flex items-start gap-3.5">
            <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink text-sm">Head Office</p>
              <p className="text-sm text-ink-soft">Blue Area, Islamabad, Pakistan</p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
