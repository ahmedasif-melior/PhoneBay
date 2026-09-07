import { getAdminDb } from "@/server/db";
import { usersRepo } from "@/server/repositories/users";

const DEFAULT_ADMIN_EMAIL = "ahmed.asif@devsatmelior.com";
const DEFAULT_ADMIN_PASSWORD = "PhoneBayAdmin!2026";
const DEFAULT_ADMIN_NAME = "PhoneBay Admin";

function adminCredentials() {
  return {
    email: (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD,
    fullName: process.env.ADMIN_FULL_NAME ?? DEFAULT_ADMIN_NAME,
  };
}

export function isConfiguredAdminEmail(email: string) {
  return email.trim().toLowerCase() === adminCredentials().email;
}

async function findAuthUserByEmail(email: string) {
  const db = getAdminDb();
  const perPage = 200;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      break;
    }
  }

  return null;
}

async function upsertAdminProfile(authUserId: string, email: string, fullName: string) {
  const db = getAdminDb();
  const existingByEmail = await usersRepo.findByEmail(email);

  if (existingByEmail && existingByEmail.id !== authUserId) {
    const { error } = await db.from("users").delete().eq("id", existingByEmail.id);
    if (error) {
      await db
        .from("users")
        .update({ email: `legacy+${Date.now()}.${email}` })
        .eq("id", existingByEmail.id);
    }
  }

  const existingById = await usersRepo.findById(authUserId);
  if (existingById) {
    await usersRepo.update(authUserId, {
      fullName,
      role: "ADMIN",
      emailVerified: true,
    });
    return;
  }

  await usersRepo.create({
    id: authUserId,
    email,
    fullName,
    role: "ADMIN",
  });
}

/**
 * Creates or repairs the platform admin in Supabase Auth and public.users.
 * Login still goes through signInWithPassword after this runs.
 */
export async function ensureAdminAccount() {
  const { email, password, fullName } = adminCredentials();
  const db = getAdminDb();

  let authUser = await findAuthUserByEmail(email);

  if (!authUser) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "ADMIN",
      },
    });

    if (error || !data.user) {
      authUser = await findAuthUserByEmail(email);
      if (!authUser) {
        throw new Error(error?.message ?? "Unable to create the admin account.");
      }
    } else {
      authUser = data.user;
    }
  }

  const { error: updateError } = await db.auth.admin.updateUserById(authUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...authUser.user_metadata,
      full_name: fullName,
      role: "ADMIN",
    },
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  await upsertAdminProfile(authUser.id, email, fullName);
  return { id: authUser.id, email };
}
