"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VerifyEmailScreen({ email = "you@example.com" }: { email?: string }) {
  const router = useRouter();
  const [resent, setResent] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = () => {
    setResent(true);
    setCooldown(30);
    setTimeout(() => setResent(false), 2500);
  };

  return (
    <div className="text-center">
      <div className="h-14 w-14 rounded-full bg-brand-tint text-brand flex items-center justify-center mx-auto mb-5">
        <MailCheck className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-semibold text-ink">Check your inbox</h1>
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">
        We sent a verification link to <span className="font-medium text-ink">{email}</span>.
        Click the link to activate your account.
      </p>

      {resent && (
        <p className="text-sm text-verify-dark bg-verify-tint rounded-[var(--pb-radius-sm)] px-3.5 py-2.5 mt-5">
          Verification email resent.
        </p>
      )}

      <Button fullWidth className="mt-7" onClick={() => router.push("/dashboard")}>
        Continue
      </Button>
      <div className="flex items-center justify-center gap-4 mt-5 text-sm">
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-medium text-brand disabled:text-ink-faint disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </button>
        <span className="text-border-strong">·</span>
        <a href="/auth/signup" className="font-medium text-ink-soft">
          Change email
        </a>
      </div>
    </div>
  );
}
