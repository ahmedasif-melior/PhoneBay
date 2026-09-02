"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input, Label, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleButton, Divider } from "@/components/auth/AuthWidgets";

export type SignInAudience = "user" | "shop" | "admin";

interface SignInFormProps {
  /** Which account type is signing in. Drives copy, redirect, and default links. */
  audience?: SignInAudience;
  /** Override the forgot-password link. Defaults to `{audience}/forgot-password`. */
  forgotPasswordPath?: string;
  /** Override the sign-up link. Defaults to `{audience}/sign-up`. Ignored for admin (no self sign-up). */
  signUpPath?: string;
  /** Override the post-signin redirect. Defaults per audience. */
  successPath?: string;
}

const AUDIENCE_COPY: Record<SignInAudience, { title: string; subtitle: string }> = {
  user: {
    title: "Welcome back",
    subtitle: "Sign in to your PhoneBay account.",
  },
  shop: {
    title: "Shop sign in",
    subtitle: "Access your verification jobs, testing desk, and inventory.",
  },
  admin: {
    title: "Admin sign in",
    subtitle: "Restricted access. Authorized staff only.",
  },
};

// Where each audience lands after a successful sign-in. Keep in sync with
// the (dashboard)/dashboard, (dashboard)/shop, and (dashboard)/admin route
// groups and their layout-level role guards.
const DEFAULT_SUCCESS_PATH: Record<SignInAudience, string> = {
  user: "/dashboard",
  shop: "/shop/dashboard",
  admin: "/admin",
};

// Sign-in submits to one shared endpoint; the backend determines the
// account's actual role from the credentials rather than trusting the
// audience the form was rendered with. Adjust here if that ever changes.
const SIGNIN_ENDPOINT = "/api/auth/signin";

export function SignInForm({ audience = "user", forgotPasswordPath, signUpPath, successPath }: SignInFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const copy = AUDIENCE_COPY[audience];
  const resolvedForgotPasswordPath = forgotPasswordPath ?? `/${audience}/forgot-password`;
  const resolvedSignUpPath = signUpPath ?? `/${audience}/sign-up`;
  const resolvedSuccessPath = successPath ?? DEFAULT_SUCCESS_PATH[audience];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const response = await fetch(SIGNIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, expectedRole: audience === "user" ? "USER" : audience.toUpperCase() }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to sign in. Please try again.");
      return;
    }
    router.push(resolvedSuccessPath);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{copy.title}</h1>
      <p className="text-sm text-ink-soft mt-1.5">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-4">
        {error && <p className="text-sm text-danger bg-danger-tint rounded-(--pb-radius-sm) px-3.5 py-2.5">{error}</p>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" leadingIcon={<Mail className="h-4 w-4" />} autoComplete="email" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link href={resolvedForgotPasswordPath} className="text-sm font-medium text-brand">
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

      {audience !== "admin" && (
        <>
          <Divider />
          <GoogleButton />
        </>
      )}

      {/* Admin accounts are provisioned internally — no self sign-up link. */}
      {audience !== "admin" && (
        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account?{" "}
          <Link href={resolvedSignUpPath} className="font-medium text-brand">
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}