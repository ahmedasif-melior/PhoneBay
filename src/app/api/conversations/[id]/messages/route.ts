import { NextRequest } from "next/server";
import { jsonError, jsonOk, requireUser, isAuthError } from "@/server/http";
import { conversationsRepo, messagesRepo } from "@/server/repositories/messages";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const conversation = conversationsRepo.findById(id);
    if (!conversation) return jsonError("Conversation not found.", 404);
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return jsonError("You don't have access to this conversation.", 403);
    }

    messagesRepo.markRead(id, user.id);
    const messages = messagesRepo.listByConversation(id);
    return jsonOk({ messages });
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const conversation = conversationsRepo.findById(id);
    if (!conversation) return jsonError("Conversation not found.", 404);
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return jsonError("You don't have access to this conversation.", 403);
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return jsonError("Message text is required.", 422);

    const message = messagesRepo.send({ conversationId: id, senderId: user.id, text });
    return jsonOk({ message }, 201);
  } catch (err) {
    if (isAuthError(err)) return jsonError(err.message, 401);
    throw err;
  }
}
