"use client";

import * as React from "react";
import Link from "next/link";
import { Store, Clock, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Mail, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ShopProfileRecord } from "@/server/types";

export function ShopPendingNotice({ shop }: { shop: ShopProfileRecord }) {
  const isPending = shop.verificationStatus === "pending";
  const isRejected = shop.verificationStatus === "rejected";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-[var(--pb-radius-md)] bg-brand-tint flex items-center justify-center text-brand">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">{shop.shopName}</h2>
              <p className="text-sm text-ink-soft flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {shop.city || "Pakistan"} · {shop.shopType === "new_phones" ? "New Phones Store" : "General Store (New & Used)"}
              </p>
            </div>
          </div>

          <Badge
            tone={isPending ? "warn" : isRejected ? "danger" : "verify"}
            icon={isPending ? <Clock className="h-3.5 w-3.5" /> : isRejected ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
          >
            {isPending ? "Under Review" : isRejected ? "Application Rejected" : "Verified"}
          </Badge>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          {isPending && (
            <div className="space-y-4">
              <div className="rounded-[var(--pb-radius-md)] bg-brand-tint/50 border border-brand/20 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Application Received &amp; Under Review</h3>
                    <p className="mt-1 text-sm text-ink-soft leading-relaxed">
                      Thank you for applying to become a verified PhoneBay partner shop! Our administration team reviews every shop to verify physical authenticity, store credentials, and customer trust standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--pb-radius-md)] border border-border bg-bg p-4 space-y-2.5 text-sm">
                <p className="font-medium text-ink">What happens after approval?</p>
                <ul className="space-y-1.5 text-ink-soft list-disc list-inside">
                  <li>Official <span className="font-semibold text-verify-dark">Verified Partner Shop Badge</span> on all your listings.</li>
                  <li>Access to the <span className="font-semibold text-ink">PhoneBay Diagnostic Testing Desk</span> to certify used phones and generate official certificates.</li>
                  <li>Ability to list multi-brand brand-new stock in the exclusive <span className="font-semibold text-ink">New Phones Category</span>.</li>
                  <li>Customer foot-traffic via local pickup and device inspection hub requests.</li>
                </ul>
              </div>

              <div className="text-xs text-ink-faint flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Notifications will be sent to: <span className="font-medium text-ink">{shop.shopEmail}</span>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="space-y-4">
              <div className="rounded-[var(--pb-radius-md)] bg-danger-tint border border-danger/20 p-4">
                <h3 className="text-sm font-semibold text-danger">Application Needs Revision</h3>
                <p className="mt-1 text-sm text-danger-dark leading-relaxed">
                  {shop.verificationNotes || "Your application could not be approved at this time. Please ensure valid shop location and business information are provided."}
                </p>
              </div>
              <p className="text-sm text-ink-soft">
                You can re-apply by updating your shop details or contacting our admin support team.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 pt-2">
            <Button href="/dashboard" variant="outline">
              Return to Customer Dashboard
            </Button>
            <Button href="/marketplace">
              Browse Marketplace <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
