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

// ─── Helper: get recipient ID from conversation ────────────────────────────
function getRecipientId(
  conv: ConversationListItem,
  currentUserId: string,
): string | null {
  const other = conv.otherParty?.id;
  if (other && other !== "unknown" && other !== currentUserId) return other;
  if (conv.participant1Id && conv.participant1Id !== currentUserId)
    return conv.participant1Id;
  if (conv.participant2Id && conv.participant2Id !== currentUserId)
    return conv.participant2Id;
  return null;
}

// ─── Normalise a raw Message so it always has the `text` field ────────────
function normaliseMessage(raw: Record<string, unknown>): Message {
  return {
    id: raw.id as string,
    // API returns `text`, Postgres payload returns `content`
    text: (raw.text ?? raw.content ?? "") as string,
    senderId: (raw.senderId ?? raw.sender_id ?? "") as string,
    createdAt: (raw.createdAt ?? raw.created_at ?? new Date().toISOString()) as string,
    read: Boolean(raw.read ?? (raw.read_at !== null && raw.read_at !== undefined)),
    status: (raw.status as MessageStatus | undefined) ?? "sent",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
function MessagesInboxContent() {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("id");

  // ── State ──────────────────────────────────────────────────────────────────
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
  const [loading, setLoading] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  // The active conversation thread channel (conversation:${id})
  const activeChannelRef = React.useRef<RealtimeChannel | null>(null);
  // The current user's personal inbox channel (user-inbox-${userId})
  const globalChannelRef = React.useRef<RealtimeChannel | null>(null);
  // Joined inbox channels for each recipient (so we can send without a new sub)
  const recipientChannelMapRef = React.useRef<Map<string, RealtimeChannel>>(new Map());

  const messageDedupeRef = React.useRef<Set<string>>(new Set());
  const mountedRef = React.useRef(true);
  const scrollableRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = React.useRef(true);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcastRef = React.useRef(0);
  const activeIdRef = React.useRef<string | null>(null);
  const currentUserIdRef = React.useRef<string | null>(null);

  // Keep refs in sync so realtime callbacks get current values without stale closures
  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  React.useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Load current user ──────────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const result = await response.json() as { user?: { id: string } };
        if (!cancelled && result.user?.id) {
          setCurrentUserId(result.user.id);
        }
      } catch (error) {
        console.error("[Chat] Failed to load current user:", error);
      }
    }

    void loadCurrentUser();
    return () => { cancelled = true; };
  }, []);

  // ── Scroll helpers ─────────────────────────────────────────────────────────
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

  const scrollToBottomInstant = React.useCallback(() => {
    setTimeout(() => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const handleScroll = React.useCallback(() => {
    if (!scrollableRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const isNearBottom = distanceFromBottom < 80;
    shouldAutoScrollRef.current = isNearBottom;
    if (isNearBottom) setShowScrollBottom(false);
  }, []);

  // ── Mark conversation as read ──────────────────────────────────────────────
  const markConversationAsRead = React.useCallback(async (convId: string) => {
    try {
      await fetch(`/api/conversations/${convId}/read`, { method: "POST" });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
      );
    } catch (e) {
      console.error("[Chat] Failed to mark as read:", e);
    }
  }, []);

  // ── Reload conversation list ───────────────────────────────────────────────
  const reloadConversations = React.useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      if (!response.ok || !mountedRef.current) return;
      const result = await response.json() as { conversations?: ConversationListItem[] };
      const list = Array.isArray(result.conversations) ? result.conversations : [];
      const processed = list.map((c) => ({
        ...c,
        otherParty: c.otherParty ?? {
          id: "unknown",
          fullName: "PhoneBay User",
          avatarUrl: null,
          phoneNumber: null,
        },
      }));
      setConversations(processed);
    } catch (error) {
      console.error("[Chat] Failed to reload conversations:", error);
    }
  }, []);

  // ── Handle a newly-arrived message (from broadcast or postgres_changes) ────
  const handleIncomingMessage = React.useCallback(
    (incomingMsg: Message, convId: string) => {
      if (!mountedRef.current) return;

      const myId = currentUserIdRef.current;
      const currentActive = activeIdRef.current;

      // Update sidebar preview
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === convId);
        if (index === -1) {
          // We don't have this conversation loaded yet – reload the list
          void reloadConversations();
          return prev;
        }
        const target = prev[index];
        const isCurrentActive = currentActive === target.id;
        const updated: ConversationListItem = {
          ...target,
          lastMessage: incomingMsg,
          updatedAt: incomingMsg.createdAt,
          unreadCount:
            !isCurrentActive && incomingMsg.senderId !== myId
              ? target.unreadCount + 1
              : target.unreadCount,
        };
        const remaining = prev.filter((_, i) => i !== index);
        return [updated, ...remaining];
      });

      // Append to active thread
      if (convId === currentActive) {
        if (messageDedupeRef.current.has(incomingMsg.id)) return;
        messageDedupeRef.current.add(incomingMsg.id);

        setMessages((prev) => {
          // Replace optimistic placeholder that sender sees
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
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });

        // If other user's message → mark read & broadcast read receipt
        if (incomingMsg.senderId !== myId) {
          void markConversationAsRead(convId);
          void activeChannelRef.current?.send({
            type: "broadcast",
            event: "messages_read",
            payload: { conversationId: convId, readerId: myId },
          });
        }

        if (shouldAutoScrollRef.current) {
          scrollToBottomInstant();
        } else {
          setShowScrollBottom(true);
        }
      }
    },
    [markConversationAsRead, reloadConversations, scrollToBottomInstant],
  );

  // ── Initial conversation load ──────────────────────────────────────────────
  React.useEffect(() => {
    let ignore = false;

    async function initConversations() {
      setLoading(true);
      try {
        const response = await fetch("/api/conversations", { cache: "no-store" });
        if (!response.ok) return;

        const result = await response.json() as { conversations?: ConversationListItem[] };
        if (ignore) return;

        const list = Array.isArray(result.conversations) ? result.conversations : [];
        const processed = list.map((c) => ({
          ...c,
          otherParty: c.otherParty ?? {
            id: "unknown",
            fullName: "PhoneBay User",
            avatarUrl: null,
            phoneNumber: null,
          },
        }));

        setConversations(processed);

        setActiveId((current) => {
          if (requestedConversationId && processed.some((c) => c.id === requestedConversationId)) {
            return requestedConversationId;
          }
          if (current && processed.some((c) => c.id === current)) return current;
          return processed[0]?.id ?? null;
        });
      } catch (error) {
        console.error("[Chat] Failed to load conversations:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void initConversations();
    return () => { ignore = true; };
  }, [requestedConversationId]);

  // ── Sync URL param → active conversation ──────────────────────────────────
  const [prevRequestedId, setPrevRequestedId] = React.useState(requestedConversationId);
  if (requestedConversationId !== prevRequestedId) {
    setPrevRequestedId(requestedConversationId);
    if (requestedConversationId) {
      setActiveId(requestedConversationId);
      setShowThreadMobile(true);
    }
  }

  // ── Fetch messages for active conversation ─────────────────────────────────
  const fetchMessagesForActive = React.useCallback(
    async (targetId: string) => {
      setLoadingMessages(true);
      try {
        const response = await fetch(`/api/conversations/${targetId}/messages`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json() as { messages?: unknown[] };
        if (!mountedRef.current) return;

        const rawList = Array.isArray(result.messages) ? result.messages : [];

        const dedupedMap = new Map<string, Message>();
        rawList.forEach((m) => {
          const msg = normaliseMessage(m as Record<string, unknown>);
          dedupedMap.set(msg.id, msg);
        });

        messageDedupeRef.current = new Set(dedupedMap.keys());
        setMessages(Array.from(dedupedMap.values()));

        void markConversationAsRead(targetId);

        shouldAutoScrollRef.current = true;
        scrollToBottomInstant();
      } catch (error) {
        console.error("[Chat] Failed to load messages:", error);
      } finally {
        if (mountedRef.current) setLoadingMessages(false);
      }
    },
    [markConversationAsRead, scrollToBottomInstant],
  );

  // Fetch messages whenever active conversation changes
  React.useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    messageDedupeRef.current = new Set();
    void fetchMessagesForActive(activeId);
  }, [activeId, fetchMessagesForActive]);

  // ── GLOBAL INBOX CHANNEL (personal channel for this user) ─────────────────
  // Subscribe ONLY after currentUserId is resolved to avoid race condition.
  React.useEffect(() => {
    if (!currentUserId) return;

    const supabase = getSupabaseBrowserClient();

    // Clean up any previous global channel
    if (globalChannelRef.current) {
      void globalChannelRef.current.unsubscribe();
      globalChannelRef.current = null;
    }

    const channel = supabase
      .channel(`user-inbox-${currentUserId}`, {
        config: { broadcast: { self: true } },
      })
      // Receive inbox updates from other users (sidebar preview)
      .on("broadcast", { event: "inbox_update" }, (payload) => {
        if (!mountedRef.current) return;
        const raw = payload.payload as Record<string, unknown> | undefined;
        const msg = raw?.message as Record<string, unknown> | undefined;
        const cId = raw?.conversationId as string | undefined;
        if (msg && cId) {
          handleIncomingMessage(normaliseMessage(msg), cId);
        }
      })
      // Postgres changes fallback for messages INSERT
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (!mountedRef.current) return;
          const raw = payload.new as Record<string, unknown>;
          if (raw?.conversation_id) {
            handleIncomingMessage(normaliseMessage(raw), raw.conversation_id as string);
          }
        },
      )
      .subscribe((status, err) => {
        if (err) console.error("[Chat] Global channel error:", err);
        if (status === "SUBSCRIBED") {
          console.log(`[Chat] Subscribed to user-inbox-${currentUserId}`);
        }
      });

    globalChannelRef.current = channel;

    return () => {
      void channel.unsubscribe();
      globalChannelRef.current = null;
    };
  }, [currentUserId, handleIncomingMessage]);

  // ── ACTIVE THREAD CHANNEL (conversation:${id}) ────────────────────────────
  // Handles new messages, read receipts, and typing for the open chat.
  React.useEffect(() => {
    // Clean up previous thread channel
    if (activeChannelRef.current) {
      void activeChannelRef.current.unsubscribe();
      activeChannelRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setOtherUserTyping(false);

    if (!activeId || !currentUserId) return;

    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel(`conversation:${activeId}`, {
        // self: true so we can filter in handler (supports same-browser testing)
        config: { broadcast: { self: true } },
      })
      // 1. New message from other user (instant broadcast delivery)
      .on("broadcast", { event: "new_message" }, (payload) => {
        if (!mountedRef.current) return;
        const raw = payload.payload as Record<string, unknown> | undefined;
        const msg = raw?.message as Record<string, unknown> | undefined;
        const cId = raw?.conversationId as string | undefined;
        // Filter out our own broadcasts (self: true)
        if (msg && cId && (msg.senderId ?? msg.sender_id) !== currentUserIdRef.current) {
          handleIncomingMessage(normaliseMessage(msg), cId);
        }
      })
      // 2. Read receipt from other user
      .on("broadcast", { event: "messages_read" }, (payload) => {
        if (!mountedRef.current) return;
        const raw = payload.payload as Record<string, unknown> | undefined;
        const cId = raw?.conversationId as string;
        const readerId = raw?.readerId as string;
        // Only update if the other user read, not ourselves
        if (cId === activeIdRef.current && readerId !== currentUserIdRef.current) {
          setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
        }
      })
      // 3. Typing indicator
      .on("broadcast", { event: "typing" }, (payload) => {
        if (!mountedRef.current) return;
        const raw = payload.payload as Record<string, unknown> | undefined;
        const typingSenderId = raw?.senderId as string | undefined;
        const isTyping = Boolean(raw?.typing);

        // Filter out self (supports same-browser testing)
        if (!typingSenderId || typingSenderId === currentUserIdRef.current) return;

        setOtherUserTyping(isTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setOtherUserTyping(false);
          }, 3500);
        }
      })
      // 4. Postgres Changes fallback (INSERT)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (!mountedRef.current) return;
          const raw = payload.new as Record<string, unknown>;
          if (raw?.conversation_id === activeIdRef.current) {
            handleIncomingMessage(normaliseMessage(raw), activeIdRef.current!);
          }
        },
      )
      // 5. Postgres Changes fallback (UPDATE – read_at set)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          if (!mountedRef.current) return;
          const raw = payload.new as { id: string; read_at: string | null };
          if (raw?.read_at) {
            setMessages((prev) =>
              prev.map((m) => (m.id === raw.id ? { ...m, read: true } : m)),
            );
          }
        },
      )
      .subscribe((status, err) => {
        if (err) console.error("[Chat] Thread channel error:", err);
        if (status === "SUBSCRIBED") {
          console.log(`[Chat] Subscribed to conversation:${activeId}`);
        }
      });

    activeChannelRef.current = channel;

    return () => {
      void channel.unsubscribe();
      activeChannelRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setOtherUserTyping(false);
    };
  }, [activeId, currentUserId, handleIncomingMessage]);

  // ── Join recipient inbox channels proactively ─────────────────────────────
  // Pre-join the inbox channels for all known conversation partners so that
  // sending a broadcast to them doesn't require creating a new channel on the fly.
  React.useEffect(() => {
    if (!currentUserId || conversations.length === 0) return;

    const supabase = getSupabaseBrowserClient();
    const existingKeys = new Set(recipientChannelMapRef.current.keys());

    for (const conv of conversations) {
      const recipientId = getRecipientId(conv, currentUserId);
      if (!recipientId || existingKeys.has(recipientId)) continue;

      const ch = supabase
        .channel(`user-inbox-${recipientId}`, {
          config: { broadcast: { self: true } },
        })
        .subscribe();

      recipientChannelMapRef.current.set(recipientId, ch);
    }

    return () => {
      // Cleanup handled on unmount via mount ref
    };
  }, [conversations, currentUserId]);

  // Cleanup all recipient channels on unmount
  React.useEffect(() => {
    return () => {
      for (const ch of recipientChannelMapRef.current.values()) {
        void ch.unsubscribe();
      }
      recipientChannelMapRef.current.clear();
    };
  }, []);

  // ── Re-sync on window focus / visibility ──────────────────────────────────
  React.useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        if (activeIdRef.current) void fetchMessagesForActive(activeIdRef.current);
        void reloadConversations();
      }
    };
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [fetchMessagesForActive, reloadConversations]);

  // ── Typing broadcast ───────────────────────────────────────────────────────
  const handleTypingActivity = React.useCallback(() => {
    if (!activeChannelRef.current || !currentUserIdRef.current) return;
    const now = Date.now();
    if (now - lastTypingBroadcastRef.current > 1500) {
      lastTypingBroadcastRef.current = now;
      void activeChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: currentUserIdRef.current, typing: true },
      });
    }
  }, []);

  // ── Currently active conversation ──────────────────────────────────────────
  const active = React.useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = React.useCallback(async () => {
    const text = draft.trim();
    if (!text || !active || sending || !currentUserId) return;

    setSending(true);
    setDraft("");

    // Optimistic message shown immediately
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
    scrollToBottomInstant();

    // Optimistically update sidebar
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

      if (!response.ok) throw new Error("Failed to send");

      const data = await response.json() as { message?: Record<string, unknown> };
      const serverMsg = data.message ?? {};

      const confirmedMsg: Message = {
        id: (serverMsg.id as string) || tempId,
        text: (serverMsg.text as string) || text,
        senderId: currentUserId,
        createdAt: (serverMsg.createdAt as string) || optimisticMsg.createdAt,
        read: Boolean(serverMsg.read),
        status: "sent",
      };

      // Add to dedupe set so incoming broadcast doesn't duplicate
      messageDedupeRef.current.add(confirmedMsg.id);

      // Reconcile optimistic message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? confirmedMsg : m)),
      );

      // Update sidebar with confirmed message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id ? { ...c, lastMessage: confirmedMsg } : c,
        ),
      );

      // ── Broadcast 1: notify recipient's conversation thread ─────────────
      if (activeChannelRef.current) {
        void activeChannelRef.current.send({
          type: "broadcast",
          event: "new_message",
          payload: { message: confirmedMsg, conversationId: active.id },
        });
      }

      // ── Broadcast 2: notify recipient's inbox sidebar ───────────────────
      const recipientId = getRecipientId(active, currentUserId);
      if (recipientId) {
        // Use the pre-joined channel if available
        const recipientCh = recipientChannelMapRef.current.get(recipientId);
        if (recipientCh) {
          void recipientCh.send({
            type: "broadcast",
            event: "inbox_update",
            payload: { message: confirmedMsg, conversationId: active.id },
          });
        } else {
          // Fallback: create channel (already SUBSCRIBED by recipient, so broadcast delivers)
          const supabase = getSupabaseBrowserClient();
          const tempCh = supabase.channel(`user-inbox-${recipientId}`, {
            config: { broadcast: { self: true } },
          });
          tempCh.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              void tempCh.send({
                type: "broadcast",
                event: "inbox_update",
                payload: { message: confirmedMsg, conversationId: active.id },
              });
            }
          });
          // Store for future use
          recipientChannelMapRef.current.set(recipientId, tempCh);
        }
      }
    } catch (err) {
      console.error("[Chat] Send message error:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
      // Restore draft on failure
      setDraft(text);
    } finally {
      setSending(false);
    }
  }, [active, draft, sending, currentUserId, scrollToBottomInstant]);

  // ── Key down in draft input ────────────────────────────────────────────────
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!sending && draft.trim()) void sendMessage();
      }
    },
    [sending, draft, sendMessage],
  );

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filteredConversations = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.otherParty?.fullName?.toLowerCase() ?? "";
      const listingTitle = c.listing?.title?.toLowerCase() ?? "";
      const lastText = c.lastMessage?.text?.toLowerCase() ?? "";
      return name.includes(q) || listingTitle.includes(q) || lastText.includes(q);
    });
  }, [conversations, searchQuery]);

  const getDisplayName = (conversation: ConversationListItem) =>
    conversation.otherParty?.fullName || "PhoneBay User";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="border border-border rounded-[var(--pb-radius-lg)] overflow-hidden h-[calc(100vh-220px)] min-h-[500px] grid lg:grid-cols-[340px_1fr] bg-surface shadow-xs">
      {/* ── Conversation Sidebar ── */}
      <div
        className={cn(
          "border-r border-border flex flex-col min-h-0 bg-surface",
          showThreadMobile && "hidden lg:flex",
        )}
      >
        {/* Search */}
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

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {loading ? (
            <div className="p-6 text-center text-sm text-ink-faint animate-pulse">
              Loading conversations…
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink-faint">
              {searchQuery ? "No chats found." : "No conversations yet."}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
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
                    isSelected ? "bg-brand/10 hover:bg-brand/15" : "hover:bg-bg/60",
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
                          conversation.unreadCount > 0
                            ? "font-semibold text-ink"
                            : "font-medium text-ink",
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

                    {conversation.listing ? (
                      <p className="text-xs text-brand font-medium truncate mt-0.5">
                        {conversation.listing.title}
                      </p>
                    ) : conversation.listingId ? (
                      <p className="text-xs text-ink-faint truncate mt-0.5">
                        Listing {conversation.listingId}
                      </p>
                    ) : null}

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
            })
          )}
        </div>
      </div>

      {/* ── Active Conversation Thread ── */}
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
                        typing…
                      </span>
                    ) : active.listing ? (
                      active.listing.title
                    ) : (
                      "Direct chat"
                    )}
                  </p>
                </div>
              </div>

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

            {/* Listing Context Banner */}
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
                    <p className="font-medium text-ink truncate">{active.listing.title}</p>
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

            {/* Messages Area */}
            <div
              ref={scrollableRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
            >
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-sm text-ink-faint animate-pulse">Loading messages…</div>
                </div>
              ) : messages.length === 0 ? (
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
                <div className="flex items-center gap-1.5 bg-surface border border-border px-3.5 py-2 rounded-full w-fit shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                </div>
              )}
            </div>

            {/* Scroll-to-bottom button */}
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
                if (!sending && draft.trim()) void sendMessage();
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
                placeholder="Type your message…"
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
            {loading
              ? "Loading conversations…"
              : "Select a conversation from the sidebar to view messages."}
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
          Loading messages…
        </div>
      }
    >
      <MessagesInboxContent />
    </React.Suspense>
  );
}