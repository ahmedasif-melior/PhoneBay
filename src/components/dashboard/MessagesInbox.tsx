"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Send,
  ChevronLeft,
  Phone,
  Check,
  CheckCheck,
  Clock,
  Search,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { Avatar } from "@/components/ui/Avatar";
import { cn, formatPKR } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type MessageStatus = "sending" | "sent" | "failed";

export type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  read: boolean;
  status?: MessageStatus;
};

export type ConversationListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  storage: string;
  price: number;
  imageUrl: string;
  status: string;
  city: string;
};

export type ConversationListItem = {
  id: string;
  buyerId: string;
  sellerId: string;
  participant1Id?: string;
  participant2Id?: string;
  listingId?: string | null;
  listing?: ConversationListing | null;
  otherParty: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
    role?: string;
  } | null;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt?: string;
};

function formatMessageTime(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDateHeader(isoString: string) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

function MessagesInboxContent() {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("id");

  // State management
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(requestedConversationId);
  const [draft, setDraft] = React.useState("");
  const [showThreadMobile, setShowThreadMobile] = React.useState(Boolean(requestedConversationId));
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [otherUserTyping, setOtherUserTyping] = React.useState(false);
  const [showScrollBottom, setShowScrollBottom] = React.useState(false);

  // Refs
  const activeChannelRef = React.useRef<RealtimeChannel | null>(null);
  const globalChannelRef = React.useRef<RealtimeChannel | null>(null);
  const messageDedupeRef = React.useRef<Set<string>>(new Set());
  const mountedRef = React.useRef(true);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = React.useRef(true);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcastRef = React.useRef(0);

  // Load current user
  React.useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const result = await response.json();
        if (!cancelled && result.user?.id) {
          setCurrentUserId(result.user.id);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  // Mark conversation read helper
  const markConversationAsRead = React.useCallback(async (convId: string) => {
    try {
      await fetch(`/api/conversations/${convId}/read`, {
        method: "POST",
      });
      // Locally reset unread count in conversations state
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (e) {
      console.error("Failed to mark conversation as read:", e);
    }
  }, []);

  const [prevRequestedId, setPrevRequestedId] = React.useState(requestedConversationId);
  if (requestedConversationId !== prevRequestedId) {
    setPrevRequestedId(requestedConversationId);
    if (requestedConversationId) {
      setActiveId(requestedConversationId);
      setShowThreadMobile(true);
    }
  }

  // Reload conversation list helper
  const reloadConversations = React.useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      if (!response.ok || !mountedRef.current) return;
      const result = await response.json();
      const list: ConversationListItem[] = Array.isArray(result.conversations)
        ? result.conversations
        : [];
      const processed = list.map((c) => {
        if (!c.otherParty) {
          c.otherParty = {
            id: "unknown",
            fullName: "PhoneBay User",
            avatarUrl: null,
            phoneNumber: null,
          };
        }
        return c;
      });
      setConversations(processed);
    } catch (error) {
      console.error("Failed to reload conversations:", error);
    }
  }, []);

  // Initial conversation load
  React.useEffect(() => {
    let ignore = false;

    async function initConversations() {
      try {
        const response = await fetch("/api/conversations", { cache: "no-store" });
        if (!response.ok) return;

        const result = await response.json();
        if (ignore) return;

        const list: ConversationListItem[] = Array.isArray(result.conversations)
          ? result.conversations
          : [];

        const processed = list.map((c) => {
          if (!c.otherParty) {
            c.otherParty = {
              id: "unknown",
              fullName: "PhoneBay User",
              avatarUrl: null,
              phoneNumber: null,
            };
          }
          return c;
        });

        setConversations(processed);

        setActiveId((current) => {
          if (requestedConversationId && processed.some((c) => c.id === requestedConversationId)) {
            return requestedConversationId;
          }
          if (current && processed.some((c) => c.id === current)) {
            return current;
          }
          return processed[0]?.id ?? null;
        });
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    }

    void initConversations();

    return () => {
      ignore = true;
    };
  }, [requestedConversationId]);

  // Load messages for a conversation
  const fetchMessagesForActive = React.useCallback(
    async (targetId: string) => {
      try {
        const response = await fetch(`/api/conversations/${targetId}/messages`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();
        if (!mountedRef.current) return;

        const rawList: Message[] = Array.isArray(result.messages) ? result.messages : [];

        const dedupedMap = new Map<string, Message>();
        rawList.forEach((m) => {
          dedupedMap.set(m.id, { ...m, status: "sent" });
        });

        messageDedupeRef.current = new Set(dedupedMap.keys());
        setMessages(Array.from(dedupedMap.values()));

        void markConversationAsRead(targetId);

        shouldAutoScrollRef.current = true;
        setTimeout(() => {
          if (scrollableRef.current) {
            scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
          }
        }, 50);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    },
    [markConversationAsRead],
  );

  // Helper to handle incoming message from any source (Realtime broadcast or postgres_changes)
  const handleIncomingMessage = React.useCallback(
    (incomingMsg: Message, convId: string) => {
      if (!mountedRef.current) return;

      // Update conversation in sidebar preview and unread count
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convId);
        if (index === -1) {
          void reloadConversations();
          return prev;
        }

        const target = prev[index];
        const isCurrentActive = activeId === target.id;
        const updated: ConversationListItem = {
          ...target,
          lastMessage: incomingMsg,
          unreadCount:
            !isCurrentActive && incomingMsg.senderId !== currentUserId
              ? target.unreadCount + 1
              : target.unreadCount,
        };

        const remaining = prev.filter((_, i) => i !== index);
        return [updated, ...remaining];
      });

      // If message is for currently active conversation, append to thread
      if (convId === activeId) {
        if (messageDedupeRef.current.has(incomingMsg.id)) {
          return;
        }
        messageDedupeRef.current.add(incomingMsg.id);

        setMessages((prev) => {
          // Reconcile optimistic sending message from this sender
          const optimisticIndex = prev.findIndex(
            (m) =>
              m.status === "sending" &&
              m.senderId === incomingMsg.senderId &&
              m.text === incomingMsg.text,
          );

          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = incomingMsg;
            return updated;
          }

          if (prev.some((m) => m.id === incomingMsg.id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });

        // If from other party, mark as read & send read receipt back
        if (incomingMsg.senderId !== currentUserId) {
          void markConversationAsRead(convId);
          void activeChannelRef.current?.send({
            type: "broadcast",
            event: "messages_read",
            payload: { conversationId: convId, readerId: currentUserId },
          });
        }

        if (shouldAutoScrollRef.current) {
          setTimeout(() => {
            if (scrollableRef.current) {
              scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
            }
          }, 40);
        } else {
          setShowScrollBottom(true);
        }
      }
    },
    [activeId, currentUserId, markConversationAsRead, reloadConversations],
  );

  // Load messages when activeId changes
  React.useEffect(() => {
    if (!activeId) return;
    void fetchMessagesForActive(activeId);
  }, [activeId, fetchMessagesForActive]);

  // Global Realtime Subscription: listens to user's conversation/messages updates across all chats
  React.useEffect(() => {
    if (!currentUserId) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`user-inbox-${currentUserId}`, {
        config: {
          broadcast: { self: false },
        },
      })
      // 1. Direct Realtime Broadcast to inbox
      .on("broadcast", { event: "inbox_update" }, (payload) => {
        const msg = payload.payload?.message as Message | undefined;
        const cId = payload.payload?.conversationId as string | undefined;
        if (msg && cId) {
          handleIncomingMessage(msg, cId);
        }
      })
      // 2. Postgres changes fallback
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (!mountedRef.current) return;
          const raw = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            read_at: string | null;
            created_at: string;
          };

          if (raw && raw.conversation_id) {
            const newMsg: Message = {
              id: raw.id,
              text: raw.content,
              senderId: raw.sender_id,
              createdAt: raw.created_at,
              read: raw.read_at !== null,
              status: "sent",
            };
            handleIncomingMessage(newMsg, raw.conversation_id);
          }
        },
      )
      .subscribe();

    globalChannelRef.current = channel;

    return () => {
      if (globalChannelRef.current) {
        globalChannelRef.current.unsubscribe();
        globalChannelRef.current = null;
      }
    };
  }, [currentUserId, handleIncomingMessage]);

  // Active Thread Realtime Subscription: listens to messages, read receipts, and typing inside active chat
  React.useEffect(() => {
    if (!activeId || !currentUserId) {
      if (activeChannelRef.current) {
        activeChannelRef.current.unsubscribe();
        activeChannelRef.current = null;
      }
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`conversation:${activeId}`, {
        config: {
          broadcast: { self: false },
        },
      })
      // 1. Instant Realtime Broadcast for incoming messages
      .on("broadcast", { event: "new_message" }, (payload) => {
        const msg = payload.payload?.message as Message | undefined;
        const cId = payload.payload?.conversationId as string | undefined;
        if (msg && cId) {
          handleIncomingMessage(msg, cId);
        }
      })
      // 2. Realtime Broadcast for read receipts
      .on("broadcast", { event: "messages_read" }, (payload) => {
        if (!mountedRef.current) return;
        const cId = payload.payload?.conversationId;
        if (cId === activeId) {
          setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
        }
      })
      // 3. Typing indicator broadcast
      .on("broadcast", { event: "typing" }, (payload) => {
        if (!mountedRef.current) return;
        const typingSenderId = payload.payload?.senderId;
        const isTyping = Boolean(payload.payload?.typing);

        if (typingSenderId && typingSenderId !== currentUserId) {
          setOtherUserTyping(isTyping);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setOtherUserTyping(false);
            }, 3000);
          }
        }
      })
      // 4. Postgres Changes fallback (INSERT)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (!mountedRef.current) return;

          const raw = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            read_at: string | null;
            created_at: string;
          };

          if (raw && raw.conversation_id === activeId) {
            const incomingMsg: Message = {
              id: raw.id,
              text: raw.content,
              senderId: raw.sender_id,
              createdAt: raw.created_at,
              read: raw.read_at !== null,
              status: "sent",
            };
            handleIncomingMessage(incomingMsg, activeId);
          }
        },
      )
      // 5. Postgres Changes fallback (UPDATE)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (!mountedRef.current) return;

          const raw = payload.new as {
            id: string;
            conversation_id?: string;
            read_at: string | null;
          };

          if (raw && raw.read_at) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === raw.id ? { ...m, read: true } : m,
              ),
            );
          }
        },
      )
      .subscribe();

    activeChannelRef.current = channel;

    return () => {
      if (activeChannelRef.current) {
        activeChannelRef.current.unsubscribe();
        activeChannelRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setOtherUserTyping(false);
    };
  }, [activeId, currentUserId, handleIncomingMessage]);

  // Synchronize on window focus / tab visibility
  React.useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        if (activeId) {
          void fetchMessagesForActive(activeId);
        }
        void reloadConversations();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [activeId, fetchMessagesForActive, reloadConversations]);

  // Send typing broadcast (throttled)
  const handleTypingActivity = React.useCallback(() => {
    if (!activeChannelRef.current || !currentUserId) return;
    const now = Date.now();
    if (now - lastTypingBroadcastRef.current > 1500) {
      lastTypingBroadcastRef.current = now;
      void activeChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: currentUserId, typing: true },
      });
    }
  }, [currentUserId]);

  // Track scroll position
  const handleScroll = React.useCallback(() => {
    if (!scrollableRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    const isNearBottom = distanceFromBottom < 80;
    shouldAutoScrollRef.current = isNearBottom;
    if (isNearBottom) {
      setShowScrollBottom(false);
    }
  }, []);

  const scrollToBottom = React.useCallback(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: scrollableRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollBottom(false);
      shouldAutoScrollRef.current = true;
    }
  }, []);

  // Currently active conversation
  const active = React.useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  // Send message
  const sendMessage = React.useCallback(async () => {
    const text = draft.trim();
    if (!text || !active || sending || !currentUserId) return;

    setSending(true);
    setDraft("");

    // Optimistic message
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimisticMsg: Message = {
      id: tempId,
      text,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      read: false,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    shouldAutoScrollRef.current = true;
    setTimeout(() => scrollToBottom(), 10);

    // Update conversation sidebar preview optimistically
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === active.id);
      if (idx === -1) return prev;
      const updated = { ...prev[idx], lastMessage: optimisticMsg };
      return [updated, ...prev.filter((_, i) => i !== idx)];
    });

    try {
      const response = await fetch(`/api/conversations/${active.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      const data = await response.json();
      const confirmedMsg: Message = {
        id: data.message?.id || tempId,
        text: data.message?.text || text,
        senderId: currentUserId,
        createdAt: data.message?.createdAt || optimisticMsg.createdAt,
        read: Boolean(data.message?.read),
        status: "sent",
      };

      // Add to dedupe set
      messageDedupeRef.current.add(confirmedMsg.id);

      // Reconcile optimistic message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? confirmedMsg : m)),
      );

      // Update sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id ? { ...c, lastMessage: confirmedMsg } : c,
        ),
      );

      // 1. INSTANT BROADCAST TO ACTIVE THREAD CHANNEL (Other user sees it immediately!)
      if (activeChannelRef.current) {
        void activeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: {
            message: confirmedMsg,
            conversationId: active.id,
          },
        });
      }

      // 2. BROADCAST TO RECIPIENT'S INBOX CHANNEL (Updates their sidebar if in another conversation)
      const recipientId =
        active.otherParty?.id && active.otherParty.id !== "unknown"
          ? active.otherParty.id
          : active.participant1Id === currentUserId
            ? active.participant2Id
            : active.participant1Id;

      if (recipientId && recipientId !== currentUserId) {
        const supabase = getSupabaseBrowserClient();
        const recipientChannel = supabase.channel(`user-inbox-${recipientId}`);
        recipientChannel.subscribe((subStatus) => {
          if (subStatus === "SUBSCRIBED") {
            void recipientChannel.send({
              type: "broadcast",
              event: "inbox_update",
              payload: {
                message: confirmedMsg,
                conversationId: active.id,
              },
            });
          }
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
      // Mark failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: "failed" } : m,
        ),
      );
    } finally {
      setSending(false);
    }
  }, [active, draft, sending, currentUserId, scrollToBottom]);

  // Key down in draft input
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!sending && draft.trim()) {
          void sendMessage();
        }
      }
    },
    [sending, draft, sendMessage],
  );

  // Filter conversations with search
  const filteredConversations = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const name = c.otherParty?.fullName?.toLowerCase() || "";
      const listingTitle = c.listing?.title?.toLowerCase() || "";
      const lastText = c.lastMessage?.text?.toLowerCase() || "";
      return name.includes(q) || listingTitle.includes(q) || lastText.includes(q);
    });
  }, [conversations, searchQuery]);

  // Display name helper
  const getDisplayName = (conversation: ConversationListItem) => {
    if (conversation.otherParty?.fullName) {
      return conversation.otherParty.fullName;
    }
    return "PhoneBay User";
  };

  return (
    <div className="border border-border rounded-[var(--pb-radius-lg)] overflow-hidden h-[calc(100vh-220px)] min-h-[500px] grid lg:grid-cols-[340px_1fr] bg-surface shadow-xs">
      {/* Conversation List Sidebar */}
      <div
        className={cn(
          "border-r border-border flex flex-col min-h-0 bg-surface",
          showThreadMobile && "hidden lg:flex",
        )}
      >
        {/* Search header */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-bg rounded-[var(--pb-radius-md)] pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand border border-border"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-ink-faint">
              {searchQuery ? "No chats found." : "No conversations yet."}
            </div>
          )}

          {filteredConversations.map((conversation) => {
            const displayName = getDisplayName(conversation);
            const isSelected = activeId === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveId(conversation.id);
                  setShowThreadMobile(true);
                  void markConversationAsRead(conversation.id);
                }}
                className={cn(
                  "w-full text-left flex items-start gap-3 p-3.5 transition-colors relative",
                  isSelected
                    ? "bg-brand/10 hover:bg-brand/15"
                    : "hover:bg-bg/60",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar name={displayName} size="md" />
                  {conversation.listing && (
                    <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5 border border-border shadow-xs">
                      <ShoppingBag className="h-3 w-3 text-brand" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        "text-sm truncate",
                        conversation.unreadCount > 0 ? "font-semibold text-ink" : "font-medium text-ink",
                      )}
                    >
                      {displayName}
                    </p>
                    <span className="text-[11px] text-ink-faint shrink-0">
                      {conversation.lastMessage
                        ? formatDateHeader(conversation.lastMessage.createdAt)
                        : "New"}
                    </span>
                  </div>

                  {/* Device / Listing preview */}
                  {conversation.listing ? (
                    <p className="text-xs text-brand font-medium truncate mt-0.5">
                      {conversation.listing.title}
                    </p>
                  ) : conversation.listingId ? (
                    <p className="text-xs text-ink-faint truncate mt-0.5">
                      Listing {conversation.listingId}
                    </p>
                  ) : null}

                  {/* Last message text */}
                  <p
                    className={cn(
                      "text-xs truncate mt-1",
                      conversation.unreadCount > 0
                        ? "font-semibold text-ink"
                        : "text-ink-soft",
                    )}
                  >
                    {conversation.lastMessage?.text || "No messages yet"}
                  </p>
                </div>

                {conversation.unreadCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 self-center shadow-xs">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Conversation Thread */}
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden bg-bg/30 relative",
          !showThreadMobile && "hidden lg:flex",
        )}
      >
        {active ? (
          <>
            {/* Thread Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="lg:hidden h-8 w-8 flex items-center justify-center -ml-1 text-ink-soft hover:text-ink rounded-full hover:bg-bg"
                  onClick={() => setShowThreadMobile(false)}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <Avatar name={getDisplayName(active)} size="sm" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink text-sm truncate">
                      {getDisplayName(active)}
                    </p>
                    {active.otherParty?.role === "SHOP" && (
                      <span className="bg-brand/10 text-brand text-[10px] font-medium px-1.5 py-0.2 rounded">
                        Shop
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink-faint truncate">
                    {otherUserTyping ? (
                      <span className="text-brand font-medium animate-pulse">
                        typing...
                      </span>
                    ) : active.listing ? (
                      active.listing.title
                    ) : (
                      "Direct chat"
                    )}
                  </p>
                </div>
              </div>

              {/* Call action button if phone number is present */}
              {active.otherParty?.phoneNumber && (
                <a
                  href={`tel:${active.otherParty.phoneNumber}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg transition-colors shadow-xs"
                >
                  <Phone className="h-3.5 w-3.5 text-brand" />
                  <span>Call</span>
                </a>
              )}
            </div>

            {/* Listing Context Banner (if conversation is for a phone listing) */}
            {active.listing && (
              <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-tint/40 border-b border-border text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--pb-radius-sm)] border border-border bg-surface">
                    <Image
                      src={active.listing.imageUrl || "/images/phones/iphone-15.webp"}
                      alt={active.listing.title}
                      fill
                      sizes="40px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">
                      {active.listing.title}
                    </p>
                    <p className="font-data font-semibold text-brand">
                      {formatPKR(active.listing.price)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/marketplace/${active.listing.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline shrink-0"
                >
                  <span>View listing</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Scrollable Messages Area */}
            <div
              ref={scrollableRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="h-12 w-12 rounded-full bg-brand-tint flex items-center justify-center text-brand mb-3">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-ink">
                    Start a conversation with {getDisplayName(active)}
                  </p>
                  <p className="text-xs text-ink-faint mt-1 max-w-xs">
                    Discuss condition, verification, meeting location, or price.
                  </p>
                </div>
              ) : (
                messages.map((message, idx) => {
                  const isMine =
                    currentUserId !== null && message.senderId === currentUserId;

                  const prev = messages[idx - 1];
                  const showDateDivider =
                    !prev ||
                    new Date(prev.createdAt).toDateString() !==
                      new Date(message.createdAt).toDateString();

                  return (
                    <React.Fragment key={message.id}>
                      {showDateDivider && (
                        <div className="flex items-center justify-center my-3">
                          <span className="bg-surface/80 border border-border text-ink-faint text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-xs">
                            {formatDateHeader(message.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex flex-col max-w-[75%]",
                          isMine ? "ml-auto items-end" : "mr-auto items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-[var(--pb-radius-lg)] px-4 py-2.5 text-sm shadow-xs break-words relative",
                            isMine
                              ? "bg-brand text-white rounded-br-xs"
                              : "bg-surface text-ink border border-border rounded-bl-xs",
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.text}</p>

                          {/* Message meta (time and status) */}
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 mt-1 text-[10px]",
                              isMine ? "text-white/80" : "text-ink-faint",
                            )}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>

                            {isMine && (
                              <span className="inline-flex items-center ml-0.5">
                                {message.status === "sending" ? (
                                  <Clock className="h-3 w-3 animate-spin text-white/70" />
                                ) : message.status === "failed" ? (
                                  <span title="Send failed">
                                    <AlertCircle className="h-3 w-3 text-red-200" />
                                  </span>
                                ) : message.read ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-cyan-200" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-white/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {otherUserTyping && (
                <div className="flex items-center gap-1.5 bg-surface border border-border px-3.5 py-2 rounded-full w-fit shadow-xs animate-fade-in">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                </div>
              )}
            </div>

            {/* Scroll-to-bottom floating button */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                aria-label="Scroll to newest messages"
                className="absolute right-6 bottom-20 z-10 flex items-center gap-1 bg-surface border border-border shadow-md rounded-full px-3 py-1.5 text-xs text-brand font-medium hover:bg-bg transition-all"
              >
                <span>New messages</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Composer Box */}
            <form
              className="flex shrink-0 items-center gap-2 border-t border-border bg-surface p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!sending && draft.trim()) {
                  void sendMessage();
                }
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  handleTypingActivity();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={sending}
                autoComplete="off"
                className="h-10 min-w-0 flex-1 rounded-full border border-border bg-bg/50 px-4 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60 transition-colors"
              />

              <button
                type="submit"
                disabled={!draft.trim() || sending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-xs hover:bg-brand/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-ink-faint p-6 text-center">
            Select a conversation from the sidebar to view messages.
          </div>
        )}
      </div>
    </div>
  );
}

export function MessagesInbox() {
  return (
    <React.Suspense
      fallback={
        <div className="border border-border rounded-[var(--pb-radius-lg)] p-8 text-center text-sm text-ink-faint animate-pulse">
          Loading messages...
        </div>
      }
    >
      <MessagesInboxContent />
    </React.Suspense>
  );
}