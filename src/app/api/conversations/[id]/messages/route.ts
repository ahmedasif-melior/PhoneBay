import { NextRequest } from "next/server";

import {
  jsonError,
  jsonOk,
  requireUser,
  isAuthError,
  isAdminRole,
} from "@/server/http";

import {
  conversationsRepo,
  messagesRepo,
} from "@/server/repositories/messages";

/**
 * GET /api/conversations/[id]/messages
 *
 * Returns all messages in a conversation.
 * Requires authentication and participant verification.
 * Marks all unread messages from other participants as read.
 *
 * Uses cache: "no-store" to ensure fresh data.
 */
export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const conversation =
      await conversationsRepo.findById(id);

    if (!conversation) {
      return jsonError(
        "Conversation not found.",
        404,
      );
    }

    const isParticipant =
      conversation.buyerId === user.id ||
      conversation.sellerId === user.id;
    const isAdmin = isAdminRole(user.role);

    if (!isParticipant && !isAdmin) {
      return jsonError(
        "You don't have access to this conversation.",
        403,
      );
    }

    if (isParticipant) {
      await messagesRepo.markRead(
        id,
        user.id,
      );
    }

    const messages =
      await messagesRepo.listByConversation(id);

    return jsonOk({
      messages,
    });
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    console.error(
      "GET /api/conversations/[id]/messages failed:",
      err,
    );

    return jsonError(
      err instanceof Error
        ? err.message
        : "Failed to load messages.",
      500,
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 *
 * Sends a message in a conversation.
 * Requires authentication and participant verification.
 *
 * Database + Realtime are authoritative:
 * - Client does NOT optimistically append
 * - Realtime INSERT event will populate the message
 * - Never append the POST response and Realtime event twice
 */
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;
    const { user } = await requireUser();

    const conversation =
      await conversationsRepo.findById(id);

    if (!conversation) {
      return jsonError(
        "Conversation not found.",
        404,
      );
    }

    const isParticipant =
      conversation.buyerId === user.id ||
      conversation.sellerId === user.id;

    if (!isParticipant) {
      return jsonError(
        "You don't have access to this conversation.",
        403,
      );
    }

    const body = await req.json().catch(() => null);

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return jsonError(
        "Message text is required.",
        422,
      );
    }

    const message = await messagesRepo.send({
      conversationId: id,
      senderId: user.id,
      text,
    });

    return jsonOk(
      {
        message,
      },
      201,
    );
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    console.error(
      "POST /api/conversations/[id]/messages failed:",
      err,
    );

    return jsonError(
      err instanceof Error
        ? err.message
        : "Failed to send message.",
      500,
    );
  }
}
