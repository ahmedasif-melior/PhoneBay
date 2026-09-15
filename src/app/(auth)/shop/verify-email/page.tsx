import type { Metadata } from "next";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen";

export const metadata: Metadata = { title: "Verify Email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailScreen email={email} signUpPath="/shop/sign-up" />;
}