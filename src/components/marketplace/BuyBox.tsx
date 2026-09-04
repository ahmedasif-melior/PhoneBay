"use client";

import * as React from "react";
import { Heart, MessageCircle, Flag, ShieldCheck, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { formatPKR } from "@/lib/utils";
import type { Phone } from "@/data/phones";

export function BuyBox({ phone }: { phone: Phone }) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(phone.saved);
  const [savePending, setSavePending] = React.useState(false);
  const [buyOpen, setBuyOpen] = React.useState(false);
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [messageSent, setMessageSent] = React.useState(false);
  const [messageText, setMessageText] = React.useState(`Hi, is the ${phone.model} still available?`);
  const [orderError, setOrderError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSaveToggle = async () => {
    setSavePending(true);
    try {
      const response = await fetch(`/api/listings/${phone.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return;
      const result = await response.json();
      setSaved(Boolean(result.saved));
    } finally {
      setSavePending(false);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setOrderError("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: phone.id }),
    });
    const result = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setOrderError(result.error ?? "Unable to place this order right now.");
      return;
    }

    setOrderPlaced(true);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!messageText.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: phone.sellerId,
          listingId: phone.id,
          text: messageText.trim(),
        }),
      });

      if (response.ok) {
        setMessageSent(true);
        setMessageText("");
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewMessages = () => {
    setMessageOpen(false);
    setMessageSent(false);
    // Navigate to messages dashboard
    router.push("/dashboard/messages");
  };

  return (
    <div className="sticky top-24 bg-surface border border-border rounded-[var(--pb-radius-lg)] p-6">
      <p className="font-data text-3xl font-semibold text-ink">{formatPKR(phone.price)}</p>
      {phone.negotiable && <p className="text-sm text-ink-faint mt-1">Negotiable</p>}

      <div className="flex flex-col gap-2.5 mt-6">
        <Button fullWidth size="lg" onClick={() => setBuyOpen(true)}>
          Buy Now
        </Button>
        <Button fullWidth variant="outline" onClick={() => setMessageOpen(true)}>
          <MessageCircle className="h-4 w-4" />
          Message Seller
        </Button>
        <div className="flex gap-2.5">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleSaveToggle}
            aria-pressed={saved}
            disabled={savePending}
          >
            <Heart className={saved ? "h-4 w-4 fill-danger text-danger" : "h-4 w-4"} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" />
            Report
          </Button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex items-start gap-2.5 text-xs text-ink-faint">
        <ShieldCheck className="h-4 w-4 text-verify shrink-0 mt-0.5" />
        Payments are protected — funds are held until you confirm the device on delivery.
      </div>

      {/* Buy Order Modal */}
      <Modal open={buyOpen} onClose={() => { setBuyOpen(false); setOrderPlaced(false); setOrderError(""); }} title={orderPlaced ? undefined : "Confirm your order"}>
        {orderPlaced ? (
          <div className="text-center py-2">
            <div className="h-14 w-14 rounded-full bg-verify-tint text-verify flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg">Order placed</h3>
            <p className="text-sm text-ink-soft mt-1.5">
              Your payment is held securely until you confirm the {phone.model} on delivery.
            </p>
            <Button fullWidth className="mt-6" onClick={() => setBuyOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">{phone.model} · {phone.storage}</span>
              <span className="font-data font-medium">{formatPKR(phone.price)}</span>
            </div>
            <Alert tone="info">
              This purchase is connected to the live PhoneBay order API. No real payment is processed in this demo.
            </Alert>
            {orderError && <Alert tone="danger">{orderError}</Alert>}
            <Button fullWidth loading={submitting} onClick={handlePlaceOrder}>
              Confirm and pay
            </Button>
          </div>
        )}
      </Modal>

      {/* Message Modal */}
      <Modal 
        open={messageOpen} 
        onClose={() => { 
          setMessageOpen(false); 
          setMessageSent(false); 
        }} 
        title={messageSent ? undefined : "Message the seller"}
      >
        {messageSent ? (
          <div className="text-center py-2">
            <div className="h-14 w-14 rounded-full bg-brand-tint text-brand flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-7 w-7" />
            </div>
            <h3 className="font-semibold text-lg">Message sent!</h3>
            <p className="text-sm text-ink-soft mt-1.5">
              The seller usually replies within an hour. You can view the full conversation in your messages.
            </p>
            <Button fullWidth className="mt-6" onClick={handleViewMessages}>
              <MessageCircle className="h-4 w-4" />
              View conversation
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              fullWidth 
              variant="ghost" 
              className="mt-2"
              onClick={() => {
                setMessageOpen(false);
                setMessageSent(false);
              }}
            >
              Continue browsing
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSendMessage}>
            <textarea
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Hi, is the ${phone.model} still available?`}
              disabled={submitting}
              className="w-full min-h-28 rounded-[var(--pb-radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand disabled:opacity-60"
            />
            <Button 
              type="submit" 
              fullWidth 
              loading={submitting}
              disabled={!messageText.trim() || submitting}
            >
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </form>
        )}
      </Modal>

      {/* Report Modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report this listing">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setReportOpen(false);
          }}
        >
          <p className="text-sm text-ink-soft">
            Let us know what's wrong with this listing and our team will review it.
          </p>
          <textarea
            required
            placeholder="Describe the issue"
            className="w-full min-h-24 rounded-[var(--pb-radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand"
          />
          <Button type="submit" variant="danger" fullWidth>
            Submit report
          </Button>
        </form>
      </Modal>
    </div>
  );
}