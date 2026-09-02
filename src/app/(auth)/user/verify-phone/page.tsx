import type { Metadata } from "next";
import { VerifyPhoneScreen } from "@/components/auth/VerifyPhoneScreen";

export const metadata: Metadata = { title: "Verify Phone" };

export default function VerifyPhonePage() {
  return <VerifyPhoneScreen />;
}
