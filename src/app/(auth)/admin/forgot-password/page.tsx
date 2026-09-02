import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Admin Forgot Password" };

export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm signInPath="/admin/sign-in" />;
}
