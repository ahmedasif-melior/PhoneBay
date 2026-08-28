"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleButton, Divider } from "@/components/auth/AuthWidgets";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="text-sm text-ink-soft mt-1.5">Sign in to your PhoneBay account.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {error && <p className="text-sm text-danger bg-danger-tint rounded-[var(--pb-radius-sm)] px-3.5 py-2.5">{error}</p>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" leadingIcon={<Mail className="h-4 w-4" />} autoComplete="email" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link href="/auth/forgot-password" className="text-sm font-medium text-brand">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            leadingIcon={<Lock className="h-4 w-4" />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="current-password"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <Checkbox name="remember" />
          Remember me
        </label>
        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>

      <Divider />
      <GoogleButton />

      <p className="text-center text-sm text-ink-soft mt-6">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-brand">
          Create account
        </Link>
      </p>
    </div>
  );
}
