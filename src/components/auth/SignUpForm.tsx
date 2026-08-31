"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleButton, Divider } from "@/components/auth/AuthWidgets";

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const fullName = String(data.get("fullName") || "");
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirmPassword") || "");
    const agree = data.get("agree");

    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirmPassword = "Passwords do not match.";
    if (!agree) next.agree = "You must agree to the Terms and Privacy Policy.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone: String(data.get("phone") || "") || null, password }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setErrors({ form: result.error ?? "Unable to create your account. Please try again." });
      return;
    }
    if (result.requiresEmailVerification) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Create your PhoneBay account</h1>
      <p className="text-sm text-ink-soft mt-1.5">Buy, sell, and verify with confidence.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {errors.form && <p className="text-sm text-danger bg-danger-tint rounded-(--pb-radius-sm) px-3.5 py-2.5">{errors.form}</p>}
        <div>
          <Label htmlFor="fullName" required>
            Full Name
          </Label>
          <Input id="fullName" name="fullName" leadingIcon={<User className="h-4 w-4" />} error={!!errors.fullName} />
          {errors.fullName && <p className="mt-1.5 text-[13px] text-danger">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" leadingIcon={<Mail className="h-4 w-4" />} error={!!errors.email} />
          {errors.email && <p className="mt-1.5 text-[13px] text-danger">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number (optional)</Label>
          <Input id="phone" name="phone" type="tel" leadingIcon={<Phone className="h-4 w-4" />} placeholder="+92 3XX XXX XXXX" />
        </div>
        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            leadingIcon={<Lock className="h-4 w-4" />}
            trailingIcon={
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={!!errors.password}
          />
          {errors.password ? (
            <p className="mt-1.5 text-[13px] text-danger">{errors.password}</p>
          ) : (
            <p className="mt-1.5 text-[13px] text-ink-faint">At least 8 characters.</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword" required>
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            leadingIcon={<Lock className="h-4 w-4" />}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <p className="mt-1.5 text-[13px] text-danger">{errors.confirmPassword}</p>}
        </div>
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-soft">
            <Checkbox name="agree" className="mt-0.5" />
            I agree to the{" "}
            <Link href="/contact" className="text-brand font-medium">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/contact" className="text-brand font-medium">
              Privacy Policy
            </Link>
            .
          </label>
          {errors.agree && <p className="mt-1.5 text-[13px] text-danger">{errors.agree}</p>}
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <Divider />
      <GoogleButton />

      <p className="text-center text-sm text-ink-soft mt-6">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </div>
  );
}
