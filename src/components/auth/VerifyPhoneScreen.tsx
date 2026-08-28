"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function VerifyPhoneScreen({ phone = "+92 3XX XXX XXXX" }: { phone?: string }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [cooldown, setCooldown] = React.useState(45);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleComplete = (value: string) => {
    setCode(value);
    // Demo behaviour: any code works except "000000" to show an error state
    if (value === "000000") {
      setError(true);
      return;
    }
    setError(false);
    setVerified(true);
  };

  if (verified) {
    return (
      <div className="text-center">
        <div className="h-14 w-14 rounded-full bg-verify-tint text-verify flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Phone verified</h1>
        <p className="text-sm text-ink-soft mt-2">Your phone number has been confirmed.</p>
        <Button fullWidth className="mt-7" onClick={() => router.push("/dashboard")}>
          Continue to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-ink">Verify your phone number</h1>
      <p className="text-sm text-ink-soft mt-2">
        Enter the 6-digit code sent to <span className="font-medium text-ink">{phone}</span>
      </p>

      <div className="mt-7">
        <OtpInput onComplete={handleComplete} />
      </div>

      {error && (
        <Alert tone="danger" className="mt-5 text-left">
          That code didn't match. Please try again.
        </Alert>
      )}

      <div className="mt-6 text-sm">
        {cooldown > 0 ? (
          <p className="text-ink-faint">Resend code in {cooldown}s</p>
        ) : (
          <button
            className="font-medium text-brand"
            onClick={() => setCooldown(45)}
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}
