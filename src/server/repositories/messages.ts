import {
  generateId,
  getAdminDb,
  queryOne,
  queryRows,
} from "@/server/db";

import type {
  ConversationRecord,
  MessageRecord,
} from "@/server/types";

type C = {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  created_at: string;
  updated_at: string;
};

type M = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

const mapConversation = (r: C): ConversationRecord => ({
  id: r.id,
  listingId: r.listing_id,
  participant1Id: r.participant_1_id,
  participant2Id: r.participant_2_id,
  buyerId: r.participant_1_id,
  sellerId: r.participant_2_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapMessage = (r: M): MessageRecord => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderId: r.sender_id,
  text: r.content,
  read: r.read_at !== null,
  createdAt: r.created_at,
});

export interface EnrichedConversation extends ConversationRecord {
  otherParty: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
    role?: string;
  };
  listing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    storage: string;
    price: number;
    imageUrl: string;
    status: string;
    city: string;
  } | null;
  participants: {
    participant1: { id: string; fullName: string } | null;
    participant2: { id: string; fullName: string } | null;
  };
  lastMessage: MessageRecord | null;
  unreadCount: number;
}

export const conversationsRepo = {
  async findOrCreate(i: {
    listingId?: string | null;
    buyerId: string;
    sellerId: string;
  }) {
    const db = getAdminDb();

    const [participant1, participant2] =
      i.buyerId < i.sellerId
        ? [i.buyerId, i.sellerId]
        : [i.sellerId, i.buyerId];

    let q = db
      .from("conversations")
      .select("*")
      .eq("participant_1_id", participant1)
      .eq("participant_2_id", participant2);

    q = i.listingId
      ? q.eq("listing_id", i.listingId)
      : q.is("listing_id", null);

    const found = await queryOne<C>(q.maybeSingle());

    if (found) {
      return mapConversation(found);
    }

    const id = generateId("cvo_");

    const created = await queryOne<C>(
      db
        .from("conversations")
        .insert({
          id,
          participant_1_id: participant1,
          participant_2_id: participant2,
          listing_id: i.listingId ?? null,
        })
        .select()
        .single(),
    );

    if (!created) {
      throw new Error("Failed to create conversation.");
    }

    return mapConversation(created);
  },

  async findById(id: string) {
    const r = await queryOne<C>(
      getAdminDb()
        .from("conversations")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r ? mapConversation(r) : null;
  },

  async listForUser(id: string) {
    const rows = await queryRows<C>(
      getAdminDb()
        .from("conversations")
        .select("*")
        .or(
          `participant_1_id.eq.${id},participant_2_id.eq.${id}`,
        )
        .order("updated_at", {
          ascending: false,
        }),
    );

    return rows.map(mapConversation);
  },

  async listAll() {
    const rows = await queryRows<C>(
      getAdminDb()
        .from("conversations")
        .select("*")
        .order("updated_at", {
          ascending: false,
        }),
    );

    return rows.map(mapConversation);
  },

  /**
   * Efficiently loads and enriches conversations using batch queries.
   * Prevents N+1 database roundtrips.
   */
  async listEnrichedForUser(
    userId: string,
    isAdmin = false,
  ): Promise<EnrichedConversation[]> {
    const db = getAdminDb();

    let query = db
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!isAdmin) {
      query = query.or(
        `participant_1_id.eq.${userId},participant_2_id.eq.${userId}`,
      );
    }

    const conversationRows = await queryRows<C>(query);
    if (!conversationRows.length) {
      return [];
    }

    const conversationIds = conversationRows.map((c) => c.id);
    const participantIds = Array.from(
      new Set(
        conversationRows.flatMap((c) => [
          c.participant_1_id,
          c.participant_2_id,
        ]),
      ),
    );
    const listingIds = Array.from(
      new Set(
        conversationRows
          .map((c) => c.listing_id)
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0,
          ),
      ),
    );

    // Parallel batch fetch for messages, users, and listings
    const [messagesRows, usersRows, listingsRows] =
      await Promise.all([
        queryRows<M>(
          db
            .from("messages")
            .select("*")
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: true }),
        ),
        queryRows<{
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          role: string;
        }>(
          db
            .from("users")
            .select("id, full_name, avatar_url, phone, role")
            .in("id", participantIds),
        ),
        listingIds.length > 0
          ? queryRows<{
              id: string;
              brand: string;
              model: string;
              storage: string;
              color: string | null;
              price: number;
              image_urls: string[] | null;
              status: string;
              city: string;
            }>(
              db
                .from("listings")
                .select(
                  "id, brand, model, storage, color, price, image_urls, status, city",
                )
                .in("id", listingIds),
            )
          : Promise.resolve([]),
      ]);

    // Build lookup maps
    const messagesByConversation = new Map<
      string,
      MessageRecord[]
    >();
    for (const m of messagesRows) {
      const list =
        messagesByConversation.get(m.conversation_id) ?? [];
      list.push(mapMessage(m));
      messagesByConversation.set(m.conversation_id, list);
    }

    const usersMap = new Map<
      string,
      {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        phoneNumber: string | null;
        role: string;
      }
    >();
    for (const u of usersRows) {
      usersMap.set(u.id, {
        id: u.id,
        fullName: u.full_name || "PhoneBay User",
        avatarUrl: u.avatar_url,
        phoneNumber: u.phone,
        role: u.role,
      });
    }

    const listingsMap = new Map<
      string,
      {
        id: string;
        title: string;
        brand: string;
        model: string;
        storage: string;
        price: number;
        imageUrl: string;
        status: string;
        city: string;
      }
    >();
    for (const l of listingsRows) {
      const fallback = "/images/phones/iphone-15.webp";
      const imageUrl =
        Array.isArray(l.image_urls) && l.image_urls.length > 0
          ? l.image_urls[0]
          : fallback;

      listingsMap.set(l.id, {
        id: l.id,
        title: `${l.brand} ${l.model} · ${l.storage}`,
        brand: l.brand,
        model: l.model,
        storage: l.storage,
        price: l.price,
        imageUrl,
        status: l.status,
        city: l.city,
      });
    }

    return conversationRows.map((r) => {
      const conversation = mapConversation(r);
      const conversationMessages =
        messagesByConversation.get(r.id) ?? [];
      const otherUserId =
        r.participant_1_id === userId
          ? r.participant_2_id
          : r.participant_1_id;

      const otherUser = usersMap.get(otherUserId);
      const p1 = usersMap.get(r.participant_1_id);
      const p2 = usersMap.get(r.participant_2_id);
      const listing = r.listing_id
        ? listingsMap.get(r.listing_id) ?? null
        : null;

      const lastMessage =
        conversationMessages.length > 0
          ? conversationMessages[
              conversationMessages.length - 1
            ]
          : null;

      const unreadCount = conversationMessages.filter(
        (m) => !m.read && m.senderId !== userId,
      ).length;

      const otherParty = otherUser ?? {
        id: otherUserId,
        fullName:
          p1 && p2
            ? `${p1.fullName} ↔ ${p2.fullName}`
            : "PhoneBay User",
        avatarUrl: null,
        phoneNumber: null,
        role: "USER",
      };

      return {
        ...conversation,
        otherParty,
        listing,
        participants: {
          participant1: p1
            ? { id: p1.id, fullName: p1.fullName }
            : null,
          participant2: p2
            ? { id: p2.id, fullName: p2.fullName }
            : null,
        },
        lastMessage,
        unreadCount,
      };
    });
  },

  /**
   * Retrieve single enriched conversation.
   */
  async getEnrichedById(
    conversationId: string,
    userId: string,
  ): Promise<EnrichedConversation | null> {
    const list = await this.listEnrichedForUser(userId, true);
    return list.find((c) => c.id === conversationId) ?? null;
  },
};

export const messagesRepo = {
  async send(i: {
    conversationId: string;
    senderId: string;
    text: string;
  }) {
    const db = getAdminDb();

    const id = generateId("msg_");

    const created = await queryOne<M>(
      db
        .from("messages")
        .insert({
          id,
          conversation_id: i.conversationId,
          sender_id: i.senderId,
          content: i.text,
        })
        .select()
        .single(),
    );

    if (!created) {
      throw new Error("Failed to send message.");
    }

    // Update conversation timestamp atomically
    const { error } = await db
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", i.conversationId);

    if (error) {
      console.error(
        "Failed to update conversation timestamp:",
        error,
      );
    }

    return mapMessage(created);
  },

  async findById(id: string) {
    const r = await queryOne<M>(
      getAdminDb()
        .from("messages")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r ? mapMessage(r) : null;
  },

  async listByConversation(id: string) {
    const rows = await queryRows<M>(
      getAdminDb()
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", {
          ascending: true,
        }),
    );

    return rows.map(mapMessage);
  },

  async markRead(
    conversationId: string,
    readerId: string,
  ) {
    const { error } = await getAdminDb()
      .from("messages")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .neq("sender_id", readerId)
      .is("read_at", null);

    if (error) {
      console.error(
        "Failed to mark messages as read:",
        error,
      );
    }
  },
};
