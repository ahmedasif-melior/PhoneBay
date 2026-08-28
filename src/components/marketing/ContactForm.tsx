"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const message = String(data.get("message") || "");
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (message.trim().length < 10) next.message = "Please write at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-verify mx-auto mb-4" />
        <h3 className="font-semibold text-lg text-ink">Message sent</h3>
        <p className="text-sm text-ink-soft mt-1.5">
          Thanks for reaching out — our team will reply within one business day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <Label htmlFor="name" required>
          Full Name
        </Label>
        <Input id="name" name="name" error={!!errors.name} />
        {errors.name && <p className="mt-1.5 text-[13px] text-danger">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" name="email" type="email" error={!!errors.email} />
        {errors.email && <p className="mt-1.5 text-[13px] text-danger">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="message" required>
          Message
        </Label>
        <Textarea id="message" name="message" error={!!errors.message} />
        {errors.message && <p className="mt-1.5 text-[13px] text-danger">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg">
        Send Message
      </Button>
    </form>
  );
}
