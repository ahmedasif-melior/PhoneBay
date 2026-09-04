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
