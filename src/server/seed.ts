import bcrypt from "bcryptjs";
import { generateId, getAdminDb } from "@/server/db";

/**
 * Seeds demo data into Supabase when the users table is empty.
 * Authentication itself is intentionally not created here; Supabase Auth
 * should remain the source of truth for login identities.
 */
export async function seedIfEmpty() {
  const db = getAdminDb();
  const { count, error: countError } = await db
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return;

  const passwordHash = bcrypt.hashSync(
    process.env.ADMIN_PASSWORD ?? "PhoneBayAdmin!2026",
    10,
  );

  const adminEmail =
    process.env.ADMIN_EMAIL ?? "ahmed.asif@devsatmelior.com";

  const shops = [
    { id: generateId("shp_"), name: "Ahmed Mobile Store", email: "ahmed@ahmedmobile.pk", city: "Islamabad" },
    { id: generateId("shp_"), name: "Karachi Mobile Hub", email: "hub@karachimobile.pk", city: "Karachi" },
    { id: generateId("shp_"), name: "Lahore Phone Gallery", email: "gallery@lahorephones.pk", city: "Lahore" },
  ];

  const { error: shopError } = await db.from("shop_profiles").insert(
    shops.map((shop) => ({
      id: shop.id,
      shop_name: shop.name,
      shop_email: shop.email,
      verified: true,
      verification_status: "approved",
      services: "Device Testing,Certification,Repairs,Trade-In",
      is_active: true,
    })),
  );
  if (shopError) throw new Error(shopError.message);

  const users = [
    { id: generateId("usr_"), email: shops[0].email, full_name: shops[0].name, city: shops[0].city, role: "SHOP", shop_id: shops[0].id },
    { id: generateId("usr_"), email: "sana.tariq@example.com", full_name: "Sana Tariq", city: "Lahore", role: "USER", shop_id: null },
    { id: generateId("usr_"), email: shops[1].email, full_name: shops[1].name, city: shops[1].city, role: "SHOP", shop_id: shops[1].id },
    { id: generateId("usr_"), email: "bilal.hassan@example.com", full_name: "Bilal Hassan", city: "Rawalpindi", role: "USER", shop_id: null },
    { id: generateId("usr_"), email: shops[2].email, full_name: shops[2].name, city: shops[2].city, role: "SHOP", shop_id: shops[2].id },
    { id: generateId("usr_"), email: adminEmail, full_name: "PhoneBay Admin", city: "Islamabad", role: "ADMIN", shop_id: null },
    { id: generateId("usr_"), email: "demo@phonebay.com", full_name: "Ahmed Khan", city: "Islamabad", role: "USER", shop_id: null },
  ];

  const { error: userError } = await db.from("users").insert(
    users.map((user) => ({
      ...user,
      password_hash: passwordHash,
      email_verified: true,
      phone_verified: true,
      trust_score: 8.8,
      is_blocked: false,
    })),
  );
  if (userError) throw new Error(userError.message);

  const sellerIds = {
    ahmed: users[0].id,
    sana: users[1].id,
    karachi: users[2].id,
    bilal: users[3].id,
    lahore: users[4].id,
  };

  const listingSeeds = [
    ["Apple", "iPhone 15 Pro", "256GB", "Natural Titanium", "Excellent", 150000, "Islamabad", "Blue Area", sellerIds.ahmed, true, 9.1, 91],
    ["Apple", "iPhone 14", "128GB", "Midnight", "Good", 105000, "Lahore", "Gulberg", sellerIds.sana, true, 8.4, 86],
    ["Samsung", "Galaxy S24", "256GB", "Onyx Black", "Excellent", 128000, "Karachi", "Saddar", sellerIds.karachi, true, 9.4, 96],
    ["Samsung", "Galaxy S23", "256GB", "Cream", "Good", 92000, "Rawalpindi", "Satellite Town", sellerIds.bilal, false, null, 84],
    ["Google", "Pixel 9", "128GB", "Obsidian", "Excellent", 118000, "Islamabad", "Blue Area", sellerIds.ahmed, true, 8.9, 93],
    ["OnePlus", "OnePlus 13", "256GB", "Midnight Ocean", "Excellent", 135000, "Lahore", "DHA", sellerIds.lahore, true, 9.0, 97],
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
      negotiable: true,
      city: l[6],
      area: l[7],
      seller_id: l[8],
      status: "active",
      battery_health: l[11],
      photo_count: 0,
      image_urls: [],
      verified: l[9],
      score: l[10],
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
