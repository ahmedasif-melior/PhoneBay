import bcrypt from "bcryptjs";
import { db, generateId } from "@/server/db";

/**
 * Seeds the database with realistic demo data the first time the app boots
 * against an empty database. Safe to import repeatedly — it's a no-op once
 * any user exists. This keeps `npm run dev` working out of the box without
 * a separate seed command, while staying easy to disable (just don't call
 * it, or check SEED_DB=false) for a real deployment with real data.
 */
export function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (count > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL ?? "ahmed.asif@devsatmelior.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "PhoneBayAdmin!2026";
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  const sellers = [
    { id: generateId("usr_"), email: "ahmed@ahmedmobile.pk", fullName: "Ahmed Mobile Store", city: "Islamabad", role: "SHOP" as const, shopName: "Ahmed Mobile Store" },
    { id: generateId("usr_"), email: "sana.tariq@example.com", fullName: "Sana Tariq", city: "Lahore", role: "USER" as const },
    { id: generateId("usr_"), email: "hub@karachimobile.pk", fullName: "Karachi Mobile Hub", city: "Karachi", role: "SHOP" as const, shopName: "Karachi Mobile Hub" },
    { id: generateId("usr_"), email: "bilal.hassan@example.com", fullName: "Bilal Hassan", city: "Rawalpindi", role: "USER" as const },
    { id: generateId("usr_"), email: "gallery@lahorephones.pk", fullName: "Lahore Phone Gallery", city: "Lahore", role: "SHOP" as const, shopName: "Lahore Phone Gallery" },
  ];

  const insertUser = db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, city, role, email_verified, phone_verified, trust_score)
     VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)`
  );
  const insertShop = db.prepare(
    `INSERT INTO shop_profiles (id, user_id, shop_name, verified, services) VALUES (?, ?, ?, 1, ?)`
  );

  for (const seller of sellers) {
    insertUser.run(seller.id, seller.email, passwordHash, seller.fullName, seller.city, seller.role, 8.5 + Math.random());
    if (seller.role === "SHOP") {
      insertShop.run(generateId("shp_"), seller.id, seller.shopName, "Device Testing,Certification,Repairs,Trade-In");
    }
  }

  const adminId = generateId("usr_");
  insertUser.run(adminId, adminEmail, passwordHash, "PhoneBay Admin", "Islamabad", "ADMIN", 9.8);

  // A demo buyer account the person can sign in with directly.
  const demoBuyerId = generateId("usr_");
  insertUser.run(demoBuyerId, "demo@phonebay.com", passwordHash, "Ahmed Khan", "Islamabad", "USER", 8.7);

  const [ahmedShop, sana, karachiHub, bilal, lahoreGallery] = sellers;

  const listingsSeed = [
    {
      sellerId: ahmedShop.id,
      brand: "Apple", model: "iPhone 15 Pro", storage: "256GB", color: "Natural Titanium",
      condition: "Excellent", price: 150000, city: "Islamabad", area: "Blue Area",
      description: "Selling my iPhone 15 Pro in excellent condition. Always used with a case and tempered glass. No scratches or dents. Comes with original box, charger cable, and unused EarPods.",
      batteryHealth: 91, photoCount: 4, verified: true, score: 9.1,
    },
    {
      sellerId: sana.id,
      brand: "Apple", model: "iPhone 14", storage: "128GB", color: "Midnight",
      condition: "Good", price: 105000, city: "Lahore", area: "Gulberg",
      description: "iPhone 14 in good working condition. Minor signs of use on the frame, screen is flawless. Selling because I upgraded.",
      batteryHealth: 86, photoCount: 3, verified: true, score: 8.4,
    },
    {
      sellerId: karachiHub.id,
      brand: "Samsung", model: "Galaxy S24", storage: "256GB", color: "Onyx Black",
      condition: "Excellent", price: 128000, city: "Karachi", area: "Saddar",
      description: "Brand-condition Galaxy S24 with barely any usage. Comes with box and charger. Fixed price, verified by PhoneBay technician.",
      batteryHealth: 96, photoCount: 4, verified: true, score: 9.4,
    },
    {
      sellerId: bilal.id,
      brand: "Samsung", model: "Galaxy S23", storage: "256GB", color: "Cream",
      condition: "Good", price: 92000, city: "Rawalpindi", area: "Satellite Town",
      description: "Well maintained Galaxy S23. Small scuff on the frame, screen is perfect. Open to verification on request.",
      batteryHealth: 84, photoCount: 2, verified: false, score: null,
    },
    {
      sellerId: ahmedShop.id,
      brand: "Google", model: "Pixel 9", storage: "128GB", color: "Obsidian",
      condition: "Excellent", price: 118000, city: "Islamabad", area: "Blue Area",
      description: "Pixel 9 with clean camera, no dust or scratches. Comes with box and cable. Verified condition report available.",
      batteryHealth: 93, photoCount: 3, verified: true, score: 8.9,
    },
    {
      sellerId: lahoreGallery.id,
      brand: "OnePlus", model: "OnePlus 13", storage: "256GB", color: "Midnight Ocean",
      condition: "Excellent", price: 135000, city: "Lahore", area: "DHA",
      description: "Latest OnePlus 13, near-new condition with Hasselblad camera system. Full box contents included.",
      batteryHealth: 97, photoCount: 4, verified: true, score: 9.0,
    },
  ];

  const insertListing = db.prepare(
    `INSERT INTO listings
      (id, seller_id, brand, model, storage, color, condition, price, negotiable, city, area,
       description, status, battery_health, photo_count, verified, score, views)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'active', ?, ?, ?, ?, ?)`
  );
  const insertCertificate = db.prepare(
    `INSERT INTO certificates
      (id, listing_id, overall_score, battery_health, display_score, camera_score, performance_score, physical_condition, tested_by, valid_until)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertVerification = db.prepare(
    `INSERT INTO verification_requests (id, listing_id, technician_id, status, completed_at, score, test_results)
     VALUES (?, ?, ?, 'completed', datetime('now'), ?, ?)`
  );

  const checklist = ["Display", "Touch", "Camera", "Front Camera", "Speaker", "Microphone", "Charging", "Wi-Fi", "Bluetooth", "GPS", "Buttons"];

  for (const l of listingsSeed) {
    const id = generateId("lst_");
    insertListing.run(
      id, l.sellerId, l.brand, l.model, l.storage, l.color, l.condition, l.price,
      l.city, l.area, l.description, l.batteryHealth, l.photoCount, l.verified ? 1 : 0, l.score, Math.floor(200 + Math.random() * 700)
    );

    if (l.verified && l.score) {
      const testResults = checklist.map((label) => ({ label, status: "pass" as const }));
      insertVerification.run(generateId("vrf_"), id, l.sellerId, l.score, JSON.stringify(testResults));

      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      insertCertificate.run(
        generateId("crt_"), id, l.score, l.batteryHealth ?? 90,
        Math.min(10, l.score + 0.2), Math.min(10, l.score + 0.1), l.score, Math.max(0, l.score - 0.2),
        "PhoneBay Verified Partner", validUntil
      );
    }
  }

  // A couple of reviews for the shops.
  const insertReview = db.prepare(
    `INSERT INTO reviews (id, author_id, target_seller_id, listing_id, rating, comment) VALUES (?, ?, ?, NULL, ?, ?)`
  );
  insertReview.run(generateId("rev_"), demoBuyerId, ahmedShop.id, 5, "Exactly as described. The battery health matched the certificate and the handover was smooth.");
  insertReview.run(generateId("rev_"), demoBuyerId, karachiHub.id, 5, "Great communication and the device passport gave me real confidence before buying.");
}
