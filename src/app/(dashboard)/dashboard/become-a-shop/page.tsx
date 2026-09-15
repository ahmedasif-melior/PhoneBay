import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/http";
import { ConvertToShopForm } from "@/components/shop/ConvertToShopForm";

export const metadata: Metadata = { title: "Become a Shop" };

export default async function BecomeAShopPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/user/sign-in");
  }

  if (user.role === "SHOP") {
    redirect("/shop/dashboard");
  }

  if (user.role === "ADMIN") {
    redirect("/dashboard/settings");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Become a Shop</h1>
      <p className="text-ink-soft mt-1 mb-7">
        Turn your account into a verified shop and start selling to more buyers.
      </p>
      <ConvertToShopForm user={user} />
    </div>
  );
}
