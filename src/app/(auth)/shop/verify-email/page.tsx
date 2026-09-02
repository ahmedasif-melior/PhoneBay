import type { Metadata } from "next";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";

export const metadata: Metadata = { title: "Verify Email" };

export default function VerifyEmailPage() {
  return <VerifyEmailScreen signUpPath="/shop/sign-up" />;
}
