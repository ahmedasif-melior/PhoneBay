import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Shop Forgot Password" };

export default function ShopForgotPasswordPage() {
  return <ForgotPasswordForm signInPath="/shop/sign-in" />;
}
