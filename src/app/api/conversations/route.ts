import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { sendMessageSchema } from "@/server/validation";
import { conversationsRepo, messagesRepo } from "@/server/repositories/messages";
import { usersRepo } from "@/server/repositories/users";

export async function GET() {
  try {
    const { user } = await requireUser();
    const conversations = conversationsRepo.listForUser(user.id).map((c) => {
      const messages = messagesRepo.listByConversation(c.id);
      const other = usersRepo.findById(c.buyerId === user.id ? c.sellerId : c.buyerId);
      return {
        ...c,
        otherParty: other ? { id: other.id, fullName: other.fullName, avatarUrl: other.avatarUrl } : null,
        lastMessage: messages[messages.length - 1] ?? null,
        unreadCount: messages.filter((m) => !m.read && m.senderId !== user.id).length,
      };
    });
    return jsonOk({ conversations });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

/** Starts (or reuses) a conversation and sends the first message. */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid message.", 422, parsed.error.flatten());
    }

    const { sellerId, listingId, text } = parsed.data;
    if (sellerId === user.id) return jsonError("You can't message yourself.", 400);

    const conversation = conversationsRepo.findOrCreate({
      listingId: listingId ?? null,
      buyerId: user.id,
      sellerId,
    });
    const message = messagesRepo.send({ conversationId: conversation.id, senderId: user.id, text });

    return jsonOk({ conversation, message }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
