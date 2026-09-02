import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Shop Sign Up" };

export default function ShopSignUpPage() {
  return <SignUpForm audience="shop" />;
}