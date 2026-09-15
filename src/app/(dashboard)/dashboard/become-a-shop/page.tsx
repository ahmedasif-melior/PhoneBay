import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/http";
import { shopsRepo } from "@/server/repositories/shops";
import { ConvertToShopForm } from "@/components/shop/ConvertToShopForm";
import { ShopPendingNotice } from "@/components/shop/ShopPendingNotice";

export const metadata: Metadata = { title: "Become a Shop" };

export default async function BecomeAShopPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/user/sign-in");
  }

  if (user.role === "ADMIN") {
    redirect("/dashboard/settings");
  }

  // Check if this user has already created or applied for a shop
  const shop = await shopsRepo.findByOwnerId(user.id);

  if (shop) {
    if (shop.verificationStatus === "approved") {
      redirect("/shop/dashboard");
    }

    return (
      <div>
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-ink">Shop Application Status</h1>
          <p className="text-ink-soft mt-1">
            Track your verified shop application status and partner onboarding.
          </p>
        </div>
        <ShopPendingNotice shop={shop} />
      </div>
    );
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
