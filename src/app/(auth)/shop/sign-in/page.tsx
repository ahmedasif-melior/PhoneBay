import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Shop Sign In" };

export default function ShopSignInPage() {
  return <SignInForm audience="shop" />;
}