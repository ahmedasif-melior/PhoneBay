import {
  generateId,
  getDb,
  queryOne,
  queryRows,
} from "@/server/db";
import type {
  ConversationRecord,
  MessageRecord,
} from "@/server/types";

type C = {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
};

type M = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
};

const mc = (r: C): ConversationRecord => ({
  id: r.id,
  listingId: r.listing_id,
  buyerId: r.buyer_id,
  sellerId: r.seller_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mm = (r: M): MessageRecord => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderId: r.sender_id,
  text: r.text,
  read: r.read,
  createdAt: r.created_at,
});

export const conversationsRepo = {
  async findOrCreate(i: {
    listingId?: string | null;
    buyerId: string;
    sellerId: string;
  }) {
    let q = getDb()
      .from("conversations")
      .select("*")
      .eq("buyer_id", i.buyerId)
      .eq("seller_id", i.sellerId);

    q = i.listingId
      ? q.eq("listing_id", i.listingId)
      : q.is("listing_id", null);

    const found = await queryOne<C>(q.maybeSingle());

    if (found) {
      return mc(found);
    }

    const id = generateId("cvo_");

    const r = await queryOne<C>(
      getDb()
        .from("conversations")
        .insert({
          id,
          listing_id: i.listingId ?? null,
          buyer_id: i.buyerId,
          seller_id: i.sellerId,
        })
        .select()
        .single(),
    );

    return mc(r!);
  },

  async findById(id: string) {
    const r = await queryOne<C>(
      getDb()
        .from("conversations")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && mc(r);
  },

  async listForUser(id: string) {
    return (
      await queryRows<C>(
        getDb()
          .from("conversations")
          .select("*")
          .or(`buyer_id.eq.${id},seller_id.eq.${id}`)
          .order("updated_at", { ascending: false }),
      )
    ).map(mc);
  },
};

export const messagesRepo = {
  async send(i: {
    conversationId: string;
    senderId: string;
    text: string;
  }) {
    const id = generateId("msg_");

    const r = await queryOne<M>(
      getDb()
        .from("messages")
        .insert({
          id,
          conversation_id: i.conversationId,
          sender_id: i.senderId,
          text: i.text,
        })
        .select()
        .single(),
    );

    await getDb()
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", i.conversationId);

    return mm(r!);
  },

  async findById(id: string) {
    const r = await queryOne<M>(
      getDb()
        .from("messages")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );

    return r && mm(r);
  },

  async listByConversation(id: string) {
    return (
      await queryRows<M>(
        getDb()
          .from("messages")
          .select("*")
          .eq("conversation_id", id)
          .order("created_at"),
      )
    ).map(mm);
  },

  async markRead(conversationId: string, readerId: string) {
    await getDb()
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", readerId);
  },
};