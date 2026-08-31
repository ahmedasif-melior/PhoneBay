import { db, generateId } from "@/server/db";
import type { ConversationRecord, MessageRecord } from "@/server/types";

interface ConversationRow {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

function mapConversation(row: ConversationRow): ConversationRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: number;
  created_at: string;
}

function mapMessage(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    read: !!row.read,
    createdAt: row.created_at,
  };
}

export const conversationsRepo = {
  findOrCreate(input: { listingId?: string | null; buyerId: string; sellerId: string }): ConversationRecord {
    const existing = db
      .prepare(
        `SELECT * FROM conversations WHERE buyer_id = ? AND seller_id = ? AND
         (listing_id = ? OR (listing_id IS NULL AND ? IS NULL))`
      )
      .get(input.buyerId, input.sellerId, input.listingId ?? null, input.listingId ?? null) as
      | ConversationRow
      | undefined;
    if (existing) return mapConversation(existing);

    const id = generateId("cvo_");
    db.prepare(
      `INSERT INTO conversations (id, listing_id, buyer_id, seller_id) VALUES (?, ?, ?, ?)`
    ).run(id, input.listingId ?? null, input.buyerId, input.sellerId);
    return this.findById(id)!;
  },

  findById(id: string): ConversationRecord | null {
    const row = db.prepare("SELECT * FROM conversations WHERE id = ?").get(id) as
      | ConversationRow
      | undefined;
    return row ? mapConversation(row) : null;
  },

  listForUser(userId: string): ConversationRecord[] {
    const rows = db
      .prepare(
        `SELECT * FROM conversations WHERE buyer_id = ? OR seller_id = ? ORDER BY updated_at DESC`
      )
      .all(userId, userId) as ConversationRow[];
    return rows.map(mapConversation);
  },
};

export const messagesRepo = {
  send(input: { conversationId: string; senderId: string; text: string }): MessageRecord {
    const id = generateId("msg_");
    db.prepare(
      `INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)`
    ).run(id, input.conversationId, input.senderId, input.text);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(
      input.conversationId
    );
    return this.findById(id)!;
  },

  findById(id: string): MessageRecord | null {
    const row = db.prepare("SELECT * FROM messages WHERE id = ?").get(id) as MessageRow | undefined;
    return row ? mapMessage(row) : null;
  },

  listByConversation(conversationId: string): MessageRecord[] {
    const rows = db
      .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC")
      .all(conversationId) as MessageRow[];
    return rows.map(mapMessage);
  },

  markRead(conversationId: string, readerId: string): void {
    db.prepare(
      "UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_id != ?"
    ).run(conversationId, readerId);
  },
};
