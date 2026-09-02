"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ForgotPasswordFormProps {
  signInPath?: string;
}

export function ForgotPasswordForm({ signInPath = "/user/sign-in" }: ForgotPasswordFormProps) {
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="h-14 w-14 rounded-full bg-verify-tint text-verify flex items-center justify-center mx-auto mb-5">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Check your inbox</h1>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          We've sent a password reset link to <span className="font-medium text-ink">{email}</span>.
          It may take a few minutes to arrive.
        </p>
        <Button variant="outline" fullWidth className="mt-7" onClick={() => setSent(false)}>
          Use a different email
        </Button>
        <Link href={signInPath} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand mt-5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="text-sm text-ink-soft mt-1.5">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            leadingIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>
      <Link href={signInPath} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand mt-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </div>
  );
}
