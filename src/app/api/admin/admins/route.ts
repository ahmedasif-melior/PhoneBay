import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireAdmin, isAuthError } from "@/server/http";
import { usersRepo, toPublicUser } from "@/server/repositories/users";
import { auditLogsRepo } from "@/server/repositories/audit-logs";
import { getSupabaseServer } from "@/server/supabase";
import { z } from "zod";

const createAdminSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  fullName: z.string().trim().min(2, "Please enter a full name."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function GET() {
  try {
    const { user: adminUser } = await requireAdmin();

    // Fetch all admin users
    const admins = await usersRepo.findByRole("ADMIN");

    return jsonOk({
      admins: admins.map(toPublicUser),
    });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: adminUser } = await requireAdmin();

    const body = await req.json().catch(() => null);
    const parsed = createAdminSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid admin details.", 422, parsed.error.flatten());
    }

    const { email, fullName, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists in public.users
    const existingUser = await usersRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      return jsonError("An account with this email already exists.", 409);
    }

    const supabase = await getSupabaseServer();

    // Create admin user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      user_metadata: { full_name: fullName },
    });

    if (error || !data.user) {
      return jsonError(error?.message ?? "Failed to create admin account.", 400);
    }

    // Create admin profile in public.users using the UUID from auth.users
    const newAdmin = await usersRepo.create({
      id: data.user.id,
      email: normalizedEmail,
      fullName,
      role: "ADMIN",
    });

    await auditLogsRepo.log({
      adminId: adminUser.id,
      action: "CREATE_ADMIN",
      entityType: "USER",
      entityId: newAdmin.id,
      changes: {
        email: newAdmin.email,
        fullName: newAdmin.fullName,
      },
    });

    return jsonOk(
      {
        success: true,
        admin: toPublicUser(newAdmin),
        message: "Admin account created successfully.",
      },
      201
    );
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    console.error("Failed to create admin:", err);
    return jsonError("Failed to create admin account.", 500);
  }
}
