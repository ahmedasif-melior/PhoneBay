import { generateId, getAdminDb } from "@/server/db";

/**
 * Seeds demo data into Supabase when the users table is empty.
 *
 * public.users.id is a foreign key to auth.users(id), and there is no
 * password_hash column on public.users — Supabase Auth is the source of
 * truth for credentials (see handle_new_user() trigger + /api/auth/signup).
 * So seed users must be created through supabase.auth.admin.createUser(),
 * the same as a real signup, rather than inserted directly.
 */
export async function seedIfEmpty() {
  const db = getAdminDb();
  const { count, error: countError } = await db
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return;

  const seedPassword = process.env.SEED_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "PhoneBayDemo!2026";
  const adminEmail = process.env.ADMIN_EMAIL ?? "ahmed.asif@devsatmelior.com";

  type SeedUser = {
    key: string;
    email: string;
    fullName: string;
    city: string;
    role: "USER" | "SHOP" | "ADMIN";
    accountPurpose: "buyer" | "seller" | "both" | "shop" | null;
  };

  const shopSeeds = [
    { key: "ahmed", name: "Ahmed Mobile Store", email: "ahmed@ahmedmobile.pk", city: "Islamabad", type: "general" as const },
    { key: "karachi", name: "Karachi Mobile Hub", email: "hub@karachimobile.pk", city: "Karachi", type: "new_phones" as const },
    { key: "lahore", name: "Lahore Phone Gallery", email: "gallery@lahorephones.pk", city: "Lahore", type: "general" as const },
  ];

  const seedUsers: SeedUser[] = [
    { key: "ahmed", email: shopSeeds[0].email, fullName: shopSeeds[0].name, city: shopSeeds[0].city, role: "SHOP", accountPurpose: "shop" },
    { key: "sana", email: "sana.tariq@example.com", fullName: "Sana Tariq", city: "Lahore", role: "USER", accountPurpose: "seller" },
    { key: "karachi", email: shopSeeds[1].email, fullName: shopSeeds[1].name, city: shopSeeds[1].city, role: "SHOP", accountPurpose: "shop" },
    { key: "bilal", email: "bilal.hassan@example.com", fullName: "Bilal Hassan", city: "Rawalpindi", role: "USER", accountPurpose: "buyer" },
    { key: "lahore", email: shopSeeds[2].email, fullName: shopSeeds[2].name, city: shopSeeds[2].city, role: "SHOP", accountPurpose: "shop" },
    { key: "admin", email: adminEmail, fullName: "PhoneBay Admin", city: "Islamabad", role: "ADMIN", accountPurpose: null },
    { key: "demo", email: "demo@phonebay.com", fullName: "Ahmed Khan", city: "Islamabad", role: "USER", accountPurpose: "both" },
  ];

  const idByKey: Record<string, string> = {};

  for (const su of seedUsers) {
    const { data, error } = await db.auth.admin.createUser({
      email: su.email,
      password: seedPassword,
      email_confirm: true,
      user_metadata: { full_name: su.fullName },
    });
    if (error || !data.user) {
      throw new Error(`[SEED] Failed to create auth user ${su.email}: ${error?.message}`);
    }
    idByKey[su.key] = data.user.id;

    // The handle_new_user() trigger creates the public.users row with
    // role USER / account_purpose null; patch in the seed's role/purpose/city.
    const { error: updateError } = await db
      .from("users")
      .update({
        city: su.city,
        role: su.role,
        account_purpose: su.accountPurpose,
        email_verified: true,
        phone_verified: true,
        trust_score: 8.8,
      })
      .eq("id", data.user.id);
    if (updateError) throw new Error(updateError.message);
  }

  const shops = shopSeeds.map((s) => ({ ...s, id: generateId("shp_"), ownerId: idByKey[s.key] }));

  const { error: shopError } = await db.from("shops").insert(
    shops.map((shop) => ({
      id: shop.id,
      owner_id: shop.ownerId,
      name: shop.name,
      shop_email: shop.email,
      city: shop.city,
      shop_type: shop.type,
      verification_status: "approved",
      verified_at: new Date().toISOString(),
      services: "Device Testing,Certification,Repairs,Trade-In",
      is_active: true,
    })),
  );
  if (shopError) throw new Error(shopError.message);

  for (const shop of shops) {
    const { error } = await db.from("users").update({ shop_id: shop.id }).eq("id", shop.ownerId);
    if (error) throw new Error(error.message);
  }

  const sellerIds = {
    ahmed: idByKey.ahmed,
    sana: idByKey.sana,
    karachi: idByKey.karachi,
    bilal: idByKey.bilal,
    lahore: idByKey.lahore,
  };

  // [brand, model, storage, color, condition, price, city, area, sellerId, verified, score, batteryHealth, listingType]
  const listingSeeds = [
    ["Apple", "iPhone 15 Pro", "256GB", "Natural Titanium", "Excellent", 150000, "Islamabad", "Blue Area", sellerIds.ahmed, true, 9.1, 91, "used"],
    ["Apple", "iPhone 14", "128GB", "Midnight", "Good", 105000, "Lahore", "Gulberg", sellerIds.sana, true, 8.4, 86, "used"],
    ["Samsung", "Galaxy S24", "256GB", "Onyx Black", "Excellent", 128000, "Karachi", "Saddar", sellerIds.karachi, true, 9.4, 96, "used"],
    ["Samsung", "Galaxy S23", "256GB", "Cream", "Good", 92000, "Rawalpindi", "Satellite Town", sellerIds.bilal, false, null, 84, "used"],
    ["Google", "Pixel 9", "128GB", "Obsidian", "Excellent", 118000, "Islamabad", "Blue Area", sellerIds.ahmed, true, 8.9, 93, "used"],
    ["OnePlus", "OnePlus 13", "256GB", "Midnight Ocean", "Excellent", 135000, "Lahore", "DHA", sellerIds.lahore, true, 9.0, 97, "used"],
    // Brand-new stock from the "New Phones Only" shop (Karachi Mobile Hub).
    ["Samsung", "Galaxy S24 Ultra", "512GB", "Titanium Black", "New", 245000, "Karachi", "Saddar", sellerIds.karachi, false, null, 100, "new"],
    ["Apple", "iPhone 16", "256GB", "Black Titanium", "New", 285000, "Karachi", "Saddar", sellerIds.karachi, false, null, 100, "new"],
  ] as const;

  const listingIds = listingSeeds.map(() => generateId("lst_"));
  const { error: listingError } = await db.from("listings").insert(
    listingSeeds.map((l, i) => ({
      id: listingIds[i],
      brand: l[0],
      model: l[1],
      storage: l[2],
      color: l[3],
      condition: l[4],
      price: l[5],
      negotiable: l[12] === "used",
      city: l[6],
      area: l[7],
      seller_id: l[8],
      status: "active",
      battery_health: l[11],
      photo_count: 0,
      image_urls: [],
      verified: l[9],
      score: l[10],
      listing_type: l[12],
      views: Math.floor(200 + Math.random() * 700),
    })),
  );
  if (listingError) throw new Error(listingError.message);

  const verified = listingSeeds
    .map((l, i) => ({ seed: l, id: listingIds[i] }))
    .filter(({ seed }) => seed[9] && seed[10] !== null);

  if (verified.length) {
    const verificationRows = verified.map(({ seed, id }) => ({
      id: generateId("vrf_"),
      listing_id: id,
      technician_id: sellerIds.ahmed,
      status: "completed",
      completed_at: new Date().toISOString(),
      score: seed[10],
      test_results: [
        "Display", "Touch", "Camera", "Front Camera", "Speaker",
        "Microphone", "Charging", "Wi-Fi", "Bluetooth", "GPS", "Buttons",
      ].map((label) => ({ label, status: "pass" })),
    }));

    const { error: verificationError } = await db
      .from("verification_requests")
      .insert(verificationRows);
    if (verificationError) throw new Error(verificationError.message);

    const { error: certificateError } = await db.from("certificates").insert(
      verified.map(({ seed, id }) => ({
        id: generateId("crt_"),
        listing_id: id,
        overall_score: seed[10],
        battery_health: seed[11],
        display_score: Math.min(10, seed[10]! + 0.2),
        camera_score: Math.min(10, seed[10]! + 0.1),
        performance_score: seed[10],
        physical_condition: Math.max(0, seed[10]! - 0.2),
        tested_by: "PhoneBay Verified Partner",
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      })),
    );
    if (certificateError) throw new Error(certificateError.message);
  }

  console.log("[SEED] Demo data created.");
}
