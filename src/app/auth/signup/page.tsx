import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return <SignUpForm />;
}
