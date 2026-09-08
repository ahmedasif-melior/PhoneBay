import { getSupabaseServer } from "@/server/supabase";

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
  recentShops: Array<{ id: string; shop_name: string; owner_name: string; verified: number; services: string; email: string; city: string }>;
  verificationQueue: Array<{ id: string; status: string; requested_at: string; score: number | null; brand: string; model: string; seller_name: string }>;
};

export async function getAdminData(): Promise<AdminData> {
  const supabase = await getSupabaseServer();

  try {
    // Fetch all stats in parallel
    const [
      usersResult,
      sellersResult,
      shopkeepersResult,
      phonesResult,
      activeListingsResult,
      soldResult,
      pendingVerificationResult,
      revenueResult,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).in("role", ["USER", "SHOP", "ADMIN"]),
      supabase.from("listings").select("seller_id").not("seller_id", "is", null),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "SHOP"),
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).neq("status", "completed"),
      supabase.from("orders").select("price"),
    ]);

    const stats = {
      totalUsers: usersResult.count || 0,
      totalSellers: new Set((sellersResult.data || []).map((r: any) => r.seller_id)).size,
      totalShopkeepers: shopkeepersResult.count || 0,
      totalPhonesListed: phonesResult.count || 0,
      activeListings: activeListingsResult.count || 0,
      totalSold: soldResult.count || 0,
      pendingVerification: pendingVerificationResult.count || 0,
      revenue: (revenueResult.data || []).reduce((sum: number, order: any) => sum + (order.price || 0), 0),
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      newSignupsResult,
      activeBuyersResult,
      verifiedUsersResult,
      newListingsResult,
      pendingListingsResult,
      pausedListingsResult,
      newOrdersResult,
      processingOrdersResult,
      shippedOrdersResult,
      deliveredOrdersResult,
      cancelledOrdersResult,
      conversationsResult,
      activeThreadsResult,
      messagesResult,
      unreadResult,
      ordersResult,
      unverifiedShopsResult,
      verifiedShopsResult,
      pendingVerificationsResult,
      inProgressVerificationsResult,
      completedVerificationsResult,
      nullScoreVerificationsResult,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "USER"),
      supabase.from("users").select("id", { count: "exact", head: true }).or("email_verified.eq.true,phone_verified.eq.true"),
      supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "paused"),
      supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "processing"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "shipped"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      supabase.from("conversations").select("id", { count: "exact", head: true }).gte("updated_at", sevenDaysAgo),
      supabase.from("messages").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      // shops table (not shop_profiles)
      supabase.from("shops").select("id", { count: "exact", head: true }).not("verification_status", "eq", "approved"),
      supabase.from("shops").select("id", { count: "exact", head: true }).eq("verification_status", "approved"),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("verification_requests").select("id", { count: "exact", head: true }).is("score", null),
    ]);

    const pipeline  = {
      users: [
        { label: "New signups", value: newSignupsResult.count || 0 },
        { label: "Active buyers", value: activeBuyersResult.count || 0 },
        { label: "Sellers", value: stats.totalSellers },
        { label: "Shop accounts", value: shopkeepersResult.count || 0 },
        { label: "Verified users", value: verifiedUsersResult.count || 0 },
      ],
      listings: [
        { label: "New listings", value: newListingsResult.count || 0 },
        { label: "Active", value: activeListingsResult.count || 0 },
        { label: "Pending review", value: pendingListingsResult.count || 0 },
        { label: "Sold", value: soldResult.count || 0 },
        { label: "Paused", value: pausedListingsResult.count || 0 },
      ],
      orders: [
        { label: "New orders", value: newOrdersResult.count || 0 },
        { label: "Processing", value: processingOrdersResult.count || 0 },
        { label: "Shipped", value: shippedOrdersResult.count || 0 },
        { label: "Delivered", value: deliveredOrdersResult.count || 0 },
        { label: "Cancelled", value: cancelledOrdersResult.count || 0 },
      ],
      messages: [
        { label: "Conversations", value: conversationsResult.count || 0 },
        { label: "Active threads", value: activeThreadsResult.count || 0 },
        { label: "Messages", value: messagesResult.count || 0 },
        { label: "Unread", value: unreadResult.count || 0 },
        { label: "Converted leads", value: ordersResult.count || 0 },
      ],
      shops: [
        { label: "Total shops", value: shopkeepersResult.count || 0 },
        { label: "Verified", value: verifiedShopsResult.count || 0 },
        { label: "Pending verification", value: unverifiedShopsResult.count || 0 },
      ],
      verification: [
        { label: "Pending", value: pendingVerificationsResult.count || 0 },
        { label: "In progress", value: inProgressVerificationsResult.count || 0 },
        { label: "Completed", value: completedVerificationsResult.count || 0 },
        { label: "Awaiting score", value: nullScoreVerificationsResult.count || 0 },
        { label: "Queue", value: pendingVerificationResult.count || 0 },
      ],
      opportunities: [
        { label: "New signups", value: newSignupsResult.count || 0 },
        { label: "Qualified leads", value: activeBuyersResult.count || 0 },
        { label: "Live listings", value: activeListingsResult.count || 0 },
        { label: "Potential sales", value: 0 },
        { label: "Completed orders", value: deliveredOrdersResult.count || 0 },
      ],
    };

    // Fetch detail data - FIXED: Changed conversationsResult to conversationDetailsResult
    const [
      recentListingsResult,
      usersWithListingsResult,
      conversationDetailsResult,
      recentOrdersResult,
      recentShopsResult,
      verificationQueueResult,
    ] = await Promise.all([
      supabase
        .from("listings")
        .select("id, model, brand, status, price, users(full_name)")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.rpc("get_users_with_listings_count", { limit_val: 8 }),
      supabase
        .from("conversations")
        .select("id, buyer_id, seller_id, listing_id, created_at, users!conversations_buyer_id_fkey(full_name), messages(text)")
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("orders")
        .select("id, status, price, created_at, listings(model), users(full_name)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("shop_profiles")
        .select("id, shop_name, verified, services, users(full_name, email, city)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("verification_requests")
        .select("id, status, requested_at, score, listings(brand, model, users(full_name))")
        .order("requested_at", { ascending: false })
        .limit(6),
    ]);

    const recentListings = (recentListingsResult.data ?? []).map((row: any) => ({
      id: row.id,
      model: row.model,
      brand: row.brand,
      status: row.status,
      price: Number(row.price ?? 0),
      seller: row.users?.full_name ?? row.users?.[0]?.full_name ?? "Unknown seller",
    }));

    const usersWithListings = (usersWithListingsResult.data ?? []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name ?? "",
      email: row.email ?? "",
      role: row.role ?? "USER",
      trust_score: Number(row.trust_score ?? 0),
      listing_count: Number(row.listing_count ?? 0),
      sold_count: Number(row.sold_count ?? 0),
    }));

    const conversations = (conversationDetailsResult.data ?? []).map((row: any) => ({
      id: row.id,
      buyer_name: row.users?.full_name ?? row.users?.[0]?.full_name ?? "Buyer",
      seller_name: row.seller?.full_name ?? row.seller?.[0]?.full_name ?? "Seller",
      listing_name: row.listing?.model ?? row.listings?.model ?? "Listing",
      last_text: row.messages?.[row.messages.length - 1]?.text ?? "",
      created_at: row.created_at,
    }));

    const recentOrders = (recentOrdersResult.data ?? []).map((row: any) => ({
      id: row.id,
      status: row.status,
      price: Number(row.price ?? 0),
      created_at: row.created_at,
      listing_name: row.listings?.model ?? row.listings?.[0]?.model ?? "Listing",
      buyer_name: row.users?.full_name ?? row.users?.[0]?.full_name ?? "Buyer",
      seller_name: row.listings?.users?.full_name ?? row.listings?.users?.[0]?.full_name ?? "Seller",
    }));

    const recentShops = (recentShopsResult.data ?? []).map((row: any) => ({
      id: row.id,
      shop_name: row.shop_name,
      owner_name: row.users?.full_name ?? row.users?.[0]?.full_name ?? "Owner",
      verified: row.verified ? 1 : 0,
      services: row.services ?? "",
      email: row.users?.email ?? row.users?.[0]?.email ?? row.shop_email ?? "",
      city: row.users?.city ?? row.users?.[0]?.city ?? "",
    }));

    const verificationQueue = (verificationQueueResult.data ?? []).map((row: any) => ({
      id: row.id,
      status: row.status,
      requested_at: row.requested_at,
      score: row.score == null ? null : Number(row.score),
      brand: row.listings?.brand ?? row.listings?.[0]?.brand ?? "",
      model: row.listings?.model ?? row.listings?.[0]?.model ?? "Listing",
      seller_name:
        row.listings?.users?.full_name ??
        row.listings?.users?.[0]?.full_name ??
        "Seller",
    }));

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
    console.error("Failed to fetch admin data:", error);
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
        users: [], listings: [], orders: [], messages: [], shops: [], verification: [], opportunities: [],
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