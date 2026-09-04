"use client";

import * as React from "react";
import { Send, ChevronLeft, Phone } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  read: boolean;
};

type ConversationListItem = {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId?: string | null;
  otherParty: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
  } | null;
  lastMessage: Message | null;
  unreadCount: number;
};

export function MessagesInbox() {
  // State management
  const [conversations, setConversations] = React.useState<
    ConversationListItem[]
  >([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [showThreadMobile, setShowThreadMobile] =
    React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] =
    React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  // Refs for effect cleanup and deduplication
  const conversationRequestId = React.useRef(0);
  const messageRequestId = React.useRef(0);
  const realtimeChannelRef = React.useRef<
    RealtimeChannel | null
  >(null);
  const messageDedupeRef = React.useRef<Set<string>>(
    new Set(),
  );
  const conversationDedupeRef = React.useRef<Map<string, ConversationListItem>>(
    new Map(),
  );
  const mountedRef = React.useRef(true);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const lastScrollTopRef = React.useRef(0);
  const shouldAutoScrollRef = React.useRef(true);

  /**
   * Load currently authenticated user.
   */
  React.useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok || !mountedRef.current) {
          return;
        }

        const result = await response.json();
        if (mountedRef.current) {
          setCurrentUserId(result.user?.id ?? null);
        }
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error,
        );
      }
    }

    void loadCurrentUser();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Load conversation list.
   */
  const loadConversations = React.useCallback(async () => {
    const requestId = ++conversationRequestId.current;

    try {
      const response = await fetch("/api/conversations", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      const nextConversations: ConversationListItem[] =
        Array.isArray(result.conversations)
          ? result.conversations
          : [];

      // Ignore stale responses
      if (
        requestId !== conversationRequestId.current
      ) {
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      // Deduplicate using Map by ID
      const deduped = new Map<string, ConversationListItem>();
      nextConversations.forEach((c) => {
        // Ensure otherParty is never null - provide fallback
        if (!c.otherParty) {
          c.otherParty = {
            id: "unknown",
            fullName: "Unknown User",
            avatarUrl: null,
            phoneNumber: null
          };
        }
        deduped.set(c.id, c);
      });

      conversationDedupeRef.current = deduped;
      setConversations(Array.from(deduped.values()));

      // Keep selection if conversation still exists
      setActiveId((current) => {
        if (
          current &&
          deduped.has(current)
        ) {
          return current;
        }

        const firstId = deduped.keys().next().value;
        return firstId ?? null;
      });
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error,
      );
    }
  }, []);

  /**
   * Load messages for a conversation.
   */
  const loadMessages = React.useCallback(
    async (conversationId: string) => {
      const requestId = ++messageRequestId.current;

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        const nextMessages: Message[] =
          Array.isArray(result.messages)
            ? result.messages
            : [];

        // Ignore stale responses
        if (
          requestId !== messageRequestId.current
        ) {
          return;
        }

        if (!mountedRef.current) {
          return;
        }

        // Deduplicate by ID (database is source of truth)
        const deduped = new Map<string, Message>();
        nextMessages.forEach((m) => {
          deduped.set(m.id, m);
        });

        messageDedupeRef.current = new Set(
          deduped.keys(),
        );
        setMessages(Array.from(deduped.values()));

        // Enable auto-scroll after initial load
        shouldAutoScrollRef.current = true;
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error,
        );
      }
    },
    [],
  );

  /**
   * Subscribe to Realtime message changes.
   *
   * Filters to active conversation only.
   * Deduplicates by message ID.
   * Never blindly appends without checking existing state.
   */
  React.useEffect(() => {
    if (!activeId || !currentUserId) {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // Subscribe to message INSERTs and UPDATEs
    const channel = supabase
      .channel(`messages-${activeId}`, {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          if (!mountedRef.current) {
            return;
          }

          const raw = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            read_at: string | null;
            created_at: string;
          };

          const newMessage: Message = {
            id: raw.id,
            text: raw.content,
            senderId: raw.sender_id,
            createdAt: raw.created_at,
            read: raw.read_at !== null,
          };

          // Only add if not already present (dedupe)
          if (messageDedupeRef.current.has(newMessage.id)) {
            return;
          }

          messageDedupeRef.current.add(newMessage.id);

          setMessages((prev) => {
            // Double-check not already in state
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }

            return [...prev, newMessage];
          });

          // Auto-scroll to new message
          if (shouldAutoScrollRef.current) {
            setTimeout(() => {
              if (scrollableRef.current) {
                scrollableRef.current.scrollTop =
                  scrollableRef.current.scrollHeight;
              }
            }, 0);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          if (!mountedRef.current) {
            return;
          }

          const raw = payload.new as {
            id: string;
            read_at: string | null;
          };

          setMessages((prev) =>
            prev.map((m) =>
              m.id === raw.id
                ? { ...m, read: raw.read_at !== null }
                : m,
            ),
          );
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            "Realtime subscribed to conversation:",
            activeId,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error("Realtime channel error");
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
    };
  }, [activeId, currentUserId]);

  /**
   * Load messages when active conversation changes.
   */
  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      messageDedupeRef.current.clear();
      return;
    }

    messageDedupeRef.current.clear();
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  /**
   * Initial conversation load.
   */
  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  /**
   * Track scroll position to detect if user is reading old messages.
   */
  const handleScroll = React.useCallback(() => {
    if (!scrollableRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } =
      scrollableRef.current;
    const distanceFromBottom =
      scrollHeight - (scrollTop + clientHeight);

    // If user is within 100px of bottom, enable auto-scroll
    shouldAutoScrollRef.current = distanceFromBottom < 100;
    lastScrollTopRef.current = scrollTop;
  }, []);

  /**
   * Currently selected conversation.
   */
  const active = React.useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === activeId,
      ) ?? null,
    [conversations, activeId],
  );

  /**
   * Send a message.
   *
   * - Prevent multiple POSTs from one submission
   * - Disable composer while sending
   * - Let Realtime INSERT event populate the message
   * - Never optimistically append and then append again
   */
  const sendMessage = React.useCallback(async () => {
    const text = draft.trim();

    if (!text || !active || sending) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `/api/conversations/${active.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        },
      );

      if (!response.ok) {
        const errorText =
          await response
            .text()
            .catch(() => "");

        console.error(
          "Failed to send message:",
          errorText,
        );

        return;
      }

      // Clear input only after server accepts
      setDraft("");

      // Refresh conversation list to update preview
      await loadConversations();

      // Enable auto-scroll for next messages
      shouldAutoScrollRef.current = true;
    } catch (error) {
      console.error(
        "Failed to send message:",
        error,
      );
    } finally {
      setSending(false);
    }
  }, [
    active,
    draft,
    sending,
    loadConversations,
  ]);

  /**
   * Handle Enter key.
   */
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        if (sending || !draft.trim()) {
          return;
        }

        void sendMessage();
      }
    },
    [sending, draft, sendMessage],
  );

  // Get display name with fallback
  const getDisplayName = (conversation: ConversationListItem) => {
    if (conversation.otherParty?.fullName) {
      return conversation.otherParty.fullName;
    }
    // If otherParty is null, try to determine if user is buyer or seller
    if (currentUserId) {
      if (conversation.buyerId === currentUserId) {
        return "Seller";
      }
      if (conversation.sellerId === currentUserId) {
        return "Buyer";
      }
    }
    return "PhoneBay User";
  };

  // Get avatar fallback
  const getAvatarName = (conversation: ConversationListItem) => {
    return getDisplayName(conversation);
  };

  return (
    <div className="border border-border rounded-[var(--pb-radius-lg)] overflow-hidden h-[calc(100vh-220px)] min-h-[420px] grid lg:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <div
        className={cn(
          "border-r border-border overflow-y-auto",
          showThreadMobile &&
            "hidden lg:block",
        )}
      >
        {conversations.length === 0 && (
          <div className="p-4 text-sm text-ink-faint">
            No conversations yet.
          </div>
        )}

        {conversations.map((conversation) => {
          const displayName = getDisplayName(conversation);
          const avatarName = getAvatarName(conversation);
          
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => {
                setActiveId(conversation.id);
                setShowThreadMobile(true);
              }}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-border transition-colors",
                activeId === conversation.id
                  ? "bg-brand-tint"
                  : "hover:bg-bg",
              )}
            >
              <Avatar
                name={avatarName}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink text-sm truncate">
                    {displayName}
                  </p>

                  <span className="text-[11px] text-ink-faint shrink-0">
                    {conversation.lastMessage
                      ? new Date(
                          conversation.lastMessage.createdAt,
                        ).toLocaleDateString()
                      : "New"}
                  </span>
                </div>

                <p className="text-xs text-ink-faint truncate">
                  {conversation.listingId ??
                    "General chat"}
                </p>

                <p className="text-sm text-ink-soft truncate mt-0.5">
                  {conversation.lastMessage
                    ?.text ??
                    "Start a conversation"}
                </p>
              </div>

              {conversation.unreadCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand text-white text-[11px] flex items-center justify-center shrink-0">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active thread */}
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden",
          !showThreadMobile && "hidden lg:flex",
        )}
      >
        {active ? (
          <>
            {/* Thread header */}
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="lg:hidden h-8 w-8 flex items-center justify-center -ml-1"
                  onClick={() => setShowThreadMobile(false)}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <Avatar
                  name={getDisplayName(active)}
                  size="sm"
                />

                <div className="min-w-0">
                  <p className="font-medium text-ink text-sm truncate">
                    {getDisplayName(active)}
                  </p>

                  <p className="text-xs text-ink-faint truncate">
                    {active.listingId
                      ? `Listing ${active.listingId}`
                      : "Marketplace chat"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-bg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Call user"
                disabled={!active.otherParty?.phoneNumber}
                onClick={() => {
                  if (active.otherParty?.phoneNumber) {
                    window.location.href = `tel:${active.otherParty.phoneNumber}`;
                  }
                }}
                title={
                  !active.otherParty?.phoneNumber
                    ? "Phone number not available"
                    : "Call user"
                }
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </button>
            </div>

            {/* Scrollable messages */}
            <div
              ref={scrollableRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
            >
              <div className="flex min-h-full flex-col justify-end gap-3">
                {messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
                    No messages yet.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      currentUserId !== null &&
                      message.senderId === currentUserId;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "max-w-[75%] break-words rounded-[var(--pb-radius-md)] px-3.5 py-2.5 text-sm",
                          isMine
                            ? "self-end bg-brand text-white"
                            : "self-start bg-bg text-ink",
                        )}
                      >
                        {message.text}

                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isMine
                              ? "text-white/60"
                              : "text-ink-faint",
                          )}
                        >
                          {new Date(
                            message.createdAt,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Composer stays fixed at bottom */}
            <form
              className="flex shrink-0 items-center gap-2.5 border-t border-border bg-surface p-3.5"
              onSubmit={(event) => {
                event.preventDefault();

                if (sending) {
                  return;
                }

                void sendMessage();
              }}
            >
              <input
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  sending ? "Sending..." : "Type a message"
                }
                aria-label="Message"
                disabled={sending}
                autoComplete="off"
                className="h-10 min-w-0 flex-1 rounded-full border border-border-strong px-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:opacity-60"
              />

              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}