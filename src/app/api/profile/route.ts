import { NextRequest } from "next/server";
import { getCurrentUser, jsonError, jsonOk } from "@/server/http";
import { profileUpdateSchema } from "@/server/validation";
import { usersRepo } from "@/server/repositories/users";

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Sign in required.", 401);

  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid profile data.", 422, parsed.error.flatten());
  }

  const next = parsed.data;
  const updatedUser = await usersRepo.update(user.id, {
    fullName: next.fullName ?? user.fullName,
    phone: next.phone ?? user.phone,
    city: next.city ?? user.city,
    bio: next.bio ?? user.bio,
    accountPurpose: next.accountPurpose ?? user.accountPurpose,
    notificationPreferences: next.notificationPreferences ?? user.notificationPreferences,
  });

  if (!updatedUser) return jsonError("Unable to update profile.", 500);
  return jsonOk({ user: updatedUser });
}
