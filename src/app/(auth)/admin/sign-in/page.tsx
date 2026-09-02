import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Admin Sign In" };

export default function AdminSignInPage() {
  return <SignInForm audience="admin" />;
}