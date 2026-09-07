import { NextRequest } from "next/server";

import {
  jsonError,
  jsonOk,
  requireUser,
  isAuthError,
} from "@/server/http";

import {
  conversationsRepo,
  messagesRepo,
} from "@/server/repositories/messages";

/**
 * POST /api/conversations/[id]/read
 *
 * Marks all incoming unread messages in the conversation as read.
 * Requires authentication and participant verification.
 */
export async function POST(
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

    const conversation = await conversationsRepo.findById(id);

    if (!conversation) {
      return jsonError("Conversation not found.", 404);
    }

    const isParticipant =
      conversation.buyerId === user.id ||
      conversation.sellerId === user.id ||
      conversation.participant1Id === user.id ||
      conversation.participant2Id === user.id;

    if (!isParticipant) {
      return jsonError("You don't have access to this conversation.", 403);
    }

    await messagesRepo.markRead(id, user.id);

    return jsonOk({ success: true });
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    console.error("POST /api/conversations/[id]/read failed:", err);

    return jsonError(
      err instanceof Error ? err.message : "Failed to mark messages as read.",
      500,
    );
  }
}
