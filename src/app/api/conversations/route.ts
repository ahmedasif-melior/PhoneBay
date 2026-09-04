import { NextRequest } from "next/server";

import {
  jsonError,
  jsonOk,
  requireUser,
  isAuthError,
} from "@/server/http";

import { sendMessageSchema } from "@/server/validation";

import {
  conversationsRepo,
  messagesRepo,
} from "@/server/repositories/messages";

import { usersRepo } from "@/server/repositories/users";

/**
 * GET /api/conversations
 *
 * Returns all conversations for the authenticated user.
 * Each conversation is enriched with:
 * - otherParty (with phone number for calling)
 * - lastMessage
 * - unreadCount
 *
 * Uses cache: "no-store" to ensure fresh data.
 */
export async function GET() {
  try {
    const { user } = await requireUser();

    const conversations =
      await conversationsRepo.listForUser(user.id);

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        const messages =
          await messagesRepo.listByConversation(
            conversation.id,
          );

        const otherUserId =
          conversation.buyerId === user.id
            ? conversation.sellerId
            : conversation.buyerId;

        const other =
          await usersRepo.findById(otherUserId);

        const lastMessage =
          messages.length > 0
            ? messages[messages.length - 1]
            : null;

        const unreadCount = messages.filter(
          (message) =>
            !message.read &&
            message.senderId !== user.id,
        ).length;

        return {
          ...conversation,
          otherParty: other
            ? {
                id: other.id,
                fullName: other.fullName,
                avatarUrl: other.avatarUrl,
                phoneNumber: other.phoneNumber ?? null,
              }
            : null,
          lastMessage,
          unreadCount,
        };
      }),
    );

    return jsonOk({
      conversations: enriched,
    });
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    console.error(
      "GET /api/conversations failed:",
      err,
    );

    return jsonError(
      err instanceof Error
        ? err.message
        : "Failed to load conversations.",
      500,
    );
  }
}

/**
 * POST /api/conversations
 *
 * Creates or finds a conversation and sends the first message.
 * Requires authentication.
 * Validates that buyer and seller are different users.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser();

    const body = await req.json().catch(() => null);

    const parsed =
      sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        "Invalid message.",
        422,
        parsed.error.flatten(),
      );
    }

    const {
      sellerId,
      listingId,
      text,
    } = parsed.data;

    if (sellerId === user.id) {
      return jsonError(
        "You can't message yourself.",
        400,
      );
    }

    const conversation =
      await conversationsRepo.findOrCreate({
        listingId: listingId ?? null,
        buyerId: user.id,
        sellerId,
      });

    const message = await messagesRepo.send({
      conversationId: conversation.id,
      senderId: user.id,
      text,
    });

    return jsonOk(
      {
        conversation,
        message,
      },
      201,
    );
  } catch (err) {
    if (isAuthError(err)) {
      return jsonError(err.message, 401);
    }

    console.error(
      "POST /api/conversations failed:",
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
