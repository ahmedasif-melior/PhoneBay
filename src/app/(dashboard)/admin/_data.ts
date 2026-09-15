import { getAdminDb } from "@/server/db";

export type StageItem = {
  label: string;
  value: number;
};

export type AdminPipeline = {
  users: StageItem[];
  listings: StageItem[];
  orders: StageItem[];
  messages: StageItem[];
  shops: StageItem[];
  verification: StageItem[];
  opportunities: StageItem[];
};

export type AdminData = {
  stats: {
    totalUsers: number;
    totalSellers: number;
    totalShopkeepers: number;
    totalPhonesListed: number;
    activeListings: number;
    totalSold: number;
    pendingVerification: number;
    revenue: number;
  };
  pipeline: AdminPipeline;
  recentListings: Array<{ id: string; model: string; brand: string; status: string; price: number; seller: string }>;
  usersWithListings: Array<{ id: string; full_name: string; email: string; role: string; trust_score: number; listing_count: number; sold_count: number }>;
  conversations: Array<{ id: string; buyer_name: string; seller_name: string; listing_name: string; last_text: string; created_at: string }>;
  recentOrders: Array<{ id: string; status: string; price: number; created_at: string; listing_name: string; buyer_name: string; seller_name: string }>;
  recentShops: Array<{ id: string; shop_name: string; shop_type: string; owner_name: string; verified: number; services: string; email: string; city: string }>;
  verificationQueue: Array<{ id: string; status: string; requested_at: string; score: number | null; brand: string; model: string; seller_name: string }>;
};

export async function getAdminData(): Promise<AdminData> {
  const db = getAdminDb();

  try {
    // 1. Fetch core entity collections in parallel using service-role secret key (RLS bypass)
    const [
      usersResult,
      shopsResult,
      listingsResult,
      ordersResult,
      verificationResult,
      conversationsResult,
      messagesResult,
    ] = await Promise.all([
      db.from("users").select("id, full_name, email, role, trust_score, email_verified, phone_verified, is_blocked, created_at").order("created_at", { ascending: false }),
      db.from("shops").select("id, owner_id, name, shop_email, city, shop_type, verification_status, services, is_active, created_at").order("created_at", { ascending: false }),
      db.from("listings").select("id, seller_id, brand, model, status, price, created_at").order("created_at", { ascending: false }),
      db.from("orders").select("id, listing_id, buyer_id, seller_id, price, status, created_at").order("created_at", { ascending: false }),
      db.from("verification_requests").select("id, listing_id, status, requested_at, score").order("requested_at", { ascending: false }),
      db.from("conversations").select("id, participant_1_id, participant_2_id, listing_id, created_at, updated_at").order("updated_at", { ascending: false }).limit(20),
      db.from("messages").select("id, conversation_id, sender_id, text, read, created_at").order("created_at", { ascending: false }).limit(50),
    ]);

    const users = (usersResult.data ?? []) as any[];
    const shops = (shopsResult.data ?? []) as any[];
    const listings = (listingsResult.data ?? []) as any[];
    const orders = (ordersResult.data ?? []) as any[];
    const verifications = (verificationResult.data ?? []) as any[];
    const conversationsRaw = (conversationsResult.data ?? []) as any[];
    const messages = (messagesResult.data ?? []) as any[];

    // Fast in-memory lookup indices
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    const listingMap = new Map<string, any>();
    const userListingCounts = new Map<string, { total: number; sold: number }>();

    for (const l of listings) {
      listingMap.set(l.id, l);
      if (l.seller_id) {
        const counts = userListingCounts.get(l.seller_id) || { total: 0, sold: 0 };
        counts.total += 1;
        if (l.status === "sold") {
          counts.sold += 1;
        }
        userListingCounts.set(l.seller_id, counts);
      }
    }

    // Message lookup per conversation
    const lastMessageByConv = new Map<string, string>();
    for (const m of messages) {
      if (!lastMessageByConv.has(m.conversation_id)) {
        lastMessageByConv.set(m.conversation_id, m.text || "");
      }
    }

    // Compute platform-wide stats
    const totalSellers = new Set(listings.map((l) => l.seller_id).filter(Boolean)).size;
    const activeListingsCount = listings.filter((l) => l.status === "active").length;
    const soldListingsCount = listings.filter((l) => l.status === "sold").length;
    const pendingVerificationsCount = verifications.filter((v) => v.status !== "completed").length;
    const revenueSum = orders.reduce((sum, o) => sum + Number(o.price || 0), 0);

    const stats = {
      totalUsers: users.length,
      totalSellers,
      totalShopkeepers: shops.length,
      totalPhonesListed: listings.length,
      activeListings: activeListingsCount,
      totalSold: soldListingsCount,
      pendingVerification: pendingVerificationsCount,
      revenue: revenueSum,
    };

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const pipeline: AdminPipeline = {
      users: [
        { label: "New signups", value: users.filter((u) => new Date(u.created_at).getTime() >= thirtyDaysAgo).length },
        { label: "Active buyers", value: users.filter((u) => u.role === "USER").length },
        { label: "Sellers", value: totalSellers },
        { label: "Shop accounts", value: shops.length },
        { label: "Verified users", value: users.filter((u) => u.email_verified || u.phone_verified).length },
      ],
      listings: [
        { label: "New listings", value: listings.filter((l) => new Date(l.created_at).getTime() >= thirtyDaysAgo).length },
        { label: "Active", value: activeListingsCount },
        { label: "Pending review", value: listings.filter((l) => l.status === "pending").length },
        { label: "Sold", value: soldListingsCount },
        { label: "Paused", value: listings.filter((l) => l.status === "paused").length },
      ],
      orders: [
        { label: "New orders", value: orders.filter((o) => new Date(o.created_at).getTime() >= thirtyDaysAgo).length },
        { label: "Processing", value: orders.filter((o) => o.status === "processing").length },
        { label: "Shipped", value: orders.filter((o) => o.status === "shipped").length },
        { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
        { label: "Cancelled", value: orders.filter((o) => o.status === "cancelled").length },
      ],
      messages: [
        { label: "Conversations", value: conversationsRaw.length },
        { label: "Active threads", value: conversationsRaw.filter((c) => new Date(c.updated_at).getTime() >= sevenDaysAgo).length },
        { label: "Messages", value: messages.length },
        { label: "Unread", value: messages.filter((m) => !m.read).length },
        { label: "Converted leads", value: orders.length },
      ],
      shops: [
        { label: "Total shops", value: shops.length },
        { label: "Verified", value: shops.filter((s) => s.verification_status === "approved").length },
        { label: "Pending verification", value: shops.filter((s) => s.verification_status !== "approved").length },
      ],
      verification: [
        { label: "Pending", value: verifications.filter((v) => v.status === "pending").length },
        { label: "In progress", value: verifications.filter((v) => v.status === "in_progress").length },
        { label: "Completed", value: verifications.filter((v) => v.status === "completed").length },
        { label: "Awaiting score", value: verifications.filter((v) => v.score == null).length },
        { label: "Queue", value: pendingVerificationsCount },
      ],
      opportunities: [
        { label: "New signups", value: users.filter((u) => new Date(u.created_at).getTime() >= thirtyDaysAgo).length },
        { label: "Qualified leads", value: users.filter((u) => u.role === "USER").length },
        { label: "Live listings", value: activeListingsCount },
        { label: "Potential sales", value: listings.filter((l) => l.status === "active").reduce((sum, l) => sum + Number(l.price || 0), 0) },
        { label: "Completed orders", value: orders.filter((o) => o.status === "delivered").length },
      ],
    };

    const recentListings = listings.map((l) => ({
      id: l.id,
      model: l.model,
      brand: l.brand,
      status: l.status,
      price: Number(l.price ?? 0),
      seller: userMap.get(l.seller_id)?.full_name ?? "Seller",
    }));

    const usersWithListings = users.map((u) => {
      const counts = userListingCounts.get(u.id) || { total: 0, sold: 0 };
      return {
        id: u.id,
        full_name: u.full_name ?? "User",
        email: u.email ?? "",
        role: u.role ?? "USER",
        trust_score: Number(u.trust_score ?? 0),
        listing_count: counts.total,
        sold_count: counts.sold,
      };
    });

    const conversations = conversationsRaw.map((c) => ({
      id: c.id,
      buyer_name: userMap.get(c.participant_1_id)?.full_name ?? "Buyer",
      seller_name: userMap.get(c.participant_2_id)?.full_name ?? "Seller",
      listing_name: listingMap.get(c.listing_id)?.model ?? "Listing",
      last_text: lastMessageByConv.get(c.id) ?? "",
      created_at: c.created_at,
    }));

    const recentOrders = orders.map((o) => ({
      id: o.id,
      status: o.status,
      price: Number(o.price ?? 0),
      created_at: o.created_at,
      listing_name: listingMap.get(o.listing_id)?.model ?? "Device",
      buyer_name: userMap.get(o.buyer_id)?.full_name ?? "Buyer",
      seller_name: userMap.get(o.seller_id)?.full_name ?? "Seller",
    }));

    const recentShops = shops.map((s) => {
      const owner = userMap.get(s.owner_id);
      return {
        id: s.id,
        shop_name: s.name,
        shop_type: s.shop_type ?? "general",
        owner_name: owner?.full_name ?? "Owner",
        verified: s.verification_status === "approved" ? 1 : 0,
        services: s.services ?? "",
        email: s.shop_email ?? owner?.email ?? "",
        city: s.city ?? owner?.city ?? "",
      };
    });

    const verificationQueue = verifications.map((v) => {
      const listing = listingMap.get(v.listing_id);
      const seller = listing ? userMap.get(listing.seller_id) : null;
      return {
        id: v.id,
        status: v.status,
        requested_at: v.requested_at,
        score: v.score == null ? null : Number(v.score),
        brand: listing?.brand ?? "",
        model: listing?.model ?? "Device",
        seller_name: seller?.full_name ?? "Seller",
      };
    });

    return {
      stats,
      pipeline,
      recentListings,
      usersWithListings,
      conversations,
      recentOrders,
      recentShops,
      verificationQueue,
    };
  } catch (error) {
    console.error("[ADMIN DATA] Failed to load admin overview:", error);
    return {
      stats: {
        totalUsers: 0,
        totalSellers: 0,
        totalShopkeepers: 0,
        totalPhonesListed: 0,
        activeListings: 0,
        totalSold: 0,
        pendingVerification: 0,
        revenue: 0,
      },
      pipeline: {
        users: [],
        listings: [],
        orders: [],
        messages: [],
        shops: [],
        verification: [],
        opportunities: [],
      },
      recentListings: [],
      usersWithListings: [],
      conversations: [],
      recentOrders: [],
      recentShops: [],
      verificationQueue: [],
    };
  }
}