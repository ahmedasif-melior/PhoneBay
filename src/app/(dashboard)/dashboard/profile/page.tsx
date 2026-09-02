import type { Metadata } from "next";
import { ShieldCheck, MapPin, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";
import { getCurrentUser } from "@/server/http";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/user/sign-in");

  const memberYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink">My Profile</h1>
      <p className="text-ink-soft mt-1">Manage how you appear to buyers and sellers.</p>

      <Card className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar name={user.fullName} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-ink">{user.fullName}</h2>
            <ShieldCheck className="h-4.5 w-4.5 text-brand" />
          </div>
          <Rating value={user.trustScore} count={41} className="mt-1" />
          <div className="flex items-center gap-4 mt-2 text-sm text-ink-faint">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {user.city ?? "Your city"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Member since {memberYear}
            </span>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-ink mb-5">Edit profile</h2>
        <ProfileEditForm initialUser={user} />
      </Card>
    </div>
  );
}
