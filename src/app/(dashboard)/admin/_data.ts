import { getAdminDb } from "@/server/db";

export type StageItem = { label: string; value: number };

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

type UserRow = { id: string; full_name: string; email: string; role: string; trust_score: number; created_at: string };
type ListingRow = { id: string; seller_id: string; brand: string; model: string; status: string; price: number; created_at: string };
type OrderRow = { id: string; listing_id: string; buyer_id: string; seller_id: string; status: string; price: number; created_at: string };
type ConversationRow = { id: string; participant_1_id: string; participant_2_id: string; listing_id: string | null; created_at: string };
type MessageRow = { conversation_id: string; content: string; created_at: string };
type ShopRow = { id: string; owner_id: string; name: string; description: string | null; verification_status: string | null; city: string; created_at: string };
type VerificationRow = { id: string; listing_id: string; status: string; requested_at: string; score: number | null };

function rows<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(result.error.message);
  return result.data ?? [];
}

export async function getAdminData(): Promise<AdminData> {
  const db = getAdminDb();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [usersResult, listingsResult, ordersResult, conversationsResult, shopsResult, verificationsResult] = await Promise.all([
    db.from("users").select("id, full_name, email, role, trust_score, created_at").order("created_at", { ascending: false }),
    db.from("listings").select("id, seller_id, brand, model, status, price, created_at").order("created_at", { ascending: false }),
    db.from("orders").select("id, listing_id, buyer_id, seller_id, status, price, created_at").order("created_at", { ascending: false }),
    db.from("conversations").select("id, participant_1_id, participant_2_id, listing_id, created_at").order("created_at", { ascending: false }),
    db.from("shops").select("id, owner_id, name, description, verification_status, city, created_at").order("created_at", { ascending: false }),
    db.from("verification_requests").select("id, listing_id, status, requested_at, score").order("requested_at", { ascending: false }),
  ]);

  const users = rows(usersResult) as UserRow[];
  const listings = rows(listingsResult) as ListingRow[];
  const orders = rows(ordersResult) as OrderRow[];
  const conversations = rows(conversationsResult) as ConversationRow[];
  const shops = rows(shopsResult) as ShopRow[];
  const verifications = rows(verificationsResult) as VerificationRow[];
  const conversationIds = conversations.slice(0, 6).map((conversation) => conversation.id);
  const messagesResult = conversationIds.length
    ? await db.from("messages").select("conversation_id, content, created_at").in("conversation_id", conversationIds).order("created_at", { ascending: true })
    : { data: [], error: null };
  const messages = rows(messagesResult) as MessageRow[];

  const userById = new Map(users.map((user) => [user.id, user]));
  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const listingCountBySeller = new Map<string, number>();
  const soldCountBySeller = new Map<string, number>();
  for (const listing of listings) {
    listingCountBySeller.set(listing.seller_id, (listingCountBySeller.get(listing.seller_id) ?? 0) + 1);
    if (listing.status === "sold") soldCountBySeller.set(listing.seller_id, (soldCountBySeller.get(listing.seller_id) ?? 0) + 1);
  }
  const messageByConversation = new Map<string, string>();
  for (const message of messages) messageByConversation.set(message.conversation_id, message.content);

  const totalSellers = new Set(listings.map((listing) => listing.seller_id)).size;
  const activeListings = listings.filter((listing) => listing.status === "active").length;
  const soldListings = listings.filter((listing) => listing.status === "sold").length;
  const pendingVerifications = verifications.filter((verification) => verification.status !== "completed").length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const newUsers = users.filter((user) => user.created_at >= thirtyDaysAgo).length;

  return {
    stats: {
      totalUsers: users.length,
      totalSellers,
      totalShopkeepers: users.filter((user) => user.role === "SHOP").length,
      totalPhonesListed: listings.length,
      activeListings,
      totalSold: soldListings,
      pendingVerification: pendingVerifications,
      revenue: orders.reduce((sum, order) => sum + Number(order.price ?? 0), 0),
    },
    pipeline: {
      users: [
        { label: "New signups", value: newUsers },
        { label: "Buyers", value: users.filter((user) => user.role === "USER").length },
        { label: "Sellers", value: totalSellers },
        { label: "Shop accounts", value: users.filter((user) => user.role === "SHOP").length },
        { label: "Administrators", value: users.filter((user) => user.role === "ADMIN").length },
      ],
      listings: [
        { label: "New listings", value: listings.filter((listing) => listing.created_at >= thirtyDaysAgo).length },
        { label: "Active", value: activeListings },
        { label: "Pending review", value: listings.filter((listing) => listing.status === "pending").length },
        { label: "Sold", value: soldListings },
        { label: "Drafts", value: listings.filter((listing) => listing.status === "draft").length },
      ],
      orders: [
        { label: "New orders", value: orders.filter((order) => order.created_at >= thirtyDaysAgo).length },
        { label: "Processing", value: orders.filter((order) => order.status === "processing").length },
        { label: "Shipped", value: orders.filter((order) => order.status === "shipped").length },
        { label: "Delivered", value: deliveredOrders },
        { label: "Cancelled", value: orders.filter((order) => order.status === "cancelled").length },
      ],
      messages: [
        { label: "Conversations", value: conversations.length },
        { label: "Recent conversations", value: conversations.filter((conversation) => conversation.created_at >= thirtyDaysAgo).length },
        { label: "Messages", value: messages.length },
        { label: "Converted leads", value: orders.length },
        { label: "Completed orders", value: deliveredOrders },
      ],
      shops: [
        { label: "Total shops", value: shops.length },
        { label: "Approved", value: shops.filter((shop) => shop.verification_status === "approved").length },
        { label: "Pending verification", value: shops.filter((shop) => shop.verification_status === "pending").length },
      ],
      verification: [
        { label: "Pending", value: verifications.filter((verification) => verification.status === "pending").length },
        { label: "In progress", value: verifications.filter((verification) => verification.status === "in_progress").length },
        { label: "Completed", value: verifications.filter((verification) => verification.status === "completed").length },
        { label: "Awaiting score", value: verifications.filter((verification) => verification.score === null).length },
        { label: "Queue", value: pendingVerifications },
      ],
      opportunities: [
        { label: "New signups", value: newUsers },
        { label: "Qualified leads", value: users.filter((user) => user.role === "USER").length },
        { label: "Live listings", value: activeListings },
        { label: "Potential sales", value: orders.filter((order) => order.status !== "cancelled").length },
        { label: "Completed orders", value: deliveredOrders },
      ],
    },
    recentListings: listings.slice(0, 8).map((listing) => ({ ...listing, price: Number(listing.price), seller: userById.get(listing.seller_id)?.full_name ?? "Unknown seller" })),
    usersWithListings: users.slice(0, 8).map((user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      trust_score: Number(user.trust_score ?? 0),
      listing_count: listingCountBySeller.get(user.id) ?? 0,
      sold_count: soldCountBySeller.get(user.id) ?? 0,
    })),
    conversations: conversations.slice(0, 6).map((conversation) => ({
      id: conversation.id,
      buyer_name: userById.get(conversation.participant_1_id)?.full_name ?? "Buyer",
      seller_name: userById.get(conversation.participant_2_id)?.full_name ?? "Seller",
      listing_name: listingById.get(conversation.listing_id ?? "")?.model ?? "General inquiry",
      last_text: messageByConversation.get(conversation.id) ?? "No messages yet.",
      created_at: conversation.created_at,
    })),
    recentOrders: orders.slice(0, 6).map((order) => ({
      id: order.id,
      status: order.status,
      price: Number(order.price),
      created_at: order.created_at,
      listing_name: listingById.get(order.listing_id)?.model ?? "Listing",
      buyer_name: userById.get(order.buyer_id)?.full_name ?? "Buyer",
      seller_name: userById.get(order.seller_id)?.full_name ?? "Seller",
    })),
    recentShops: shops.slice(0, 6).map((shop) => ({
      id: shop.id,
      shop_name: shop.name,
      owner_name: userById.get(shop.owner_id)?.full_name ?? "Owner",
      verified: shop.verification_status === "approved" ? 1 : 0,
      services: shop.description ?? "",
      email: userById.get(shop.owner_id)?.email ?? "",
      city: shop.city,
    })),
    verificationQueue: verifications.slice(0, 6).map((verification) => {
      const listing = listingById.get(verification.listing_id);
      return {
        id: verification.id,
        status: verification.status,
        requested_at: verification.requested_at,
        score: verification.score === null ? null : Number(verification.score),
        brand: listing?.brand ?? "",
        model: listing?.model ?? "Listing",
        seller_name: listing ? userById.get(listing.seller_id)?.full_name ?? "Seller" : "Seller",
      };
    }),
  };
}
