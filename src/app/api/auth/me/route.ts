import { getCurrentUser, jsonOk } from "@/server/http";
import { toPublicUser } from "@/server/repositories/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonOk({ user: null });
  return jsonOk({ user: toPublicUser(user) });
}
