"use client";

import * as React from "react";
import { Send, ChevronLeft, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

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
  otherParty: { id: string; fullName: string; avatarUrl?: string | null } | null;
  lastMessage: Message | null;
  unreadCount: number;
};

export function MessagesInbox() {
  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [showThreadMobile, setShowThreadMobile] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadCurrentUser() {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;
      const result = await response.json();
      setCurrentUserId(result.user?.id ?? null);
    }
    void loadCurrentUser();
  }, []);

  const loadConversations = React.useCallback(async () => {
    const response = await fetch("/api/conversations");
    if (!response.ok) return;
    const result = await response.json();
    setConversations(result.conversations ?? []);
    setActiveId((current) => current ?? result.conversations?.[0]?.id ?? null);
  }, []);

  React.useEffect(() => {
    void loadConversations();
    const intervalId = window.setInterval(() => {
      void loadConversations();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let active = true;
    async function loadMessages() {
      const response = await fetch(`/api/conversations/${activeId}/messages`);
      if (!response.ok) return;
      const result = await response.json();
      if (!active) return;
      setMessages(result.messages ?? []);
    }
    void loadMessages();
    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 4000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [activeId]);

  const active = conversations.find((c) => c.id === activeId);

  const sendMessage = async () => {
    if (!draft.trim() || !active) return;
    const response = await fetch(`/api/conversations/${active.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft.trim() }),
    });

    if (!response.ok) return;
    const result = await response.json();
    setMessages((prev) => [...prev, result.message]);
    setDraft("");

    const refreshed = await fetch("/api/conversations");
    if (refreshed.ok) {
      const payload = await refreshed.json();
      setConversations(payload.conversations ?? []);
    }
  };

  return (
    <div className="border border-border rounded-[var(--pb-radius-lg)] overflow-hidden h-[calc(100vh-220px)] min-h-[420px] grid lg:grid-cols-[320px_1fr]">
      <div className={cn("border-r border-border overflow-y-auto", showThreadMobile && "hidden lg:block")}>
        {conversations.length === 0 && (
          <div className="p-4 text-sm text-ink-faint">No conversations yet.</div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveId(c.id);
              setShowThreadMobile(true);
            }}
            className={cn(
              "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-border transition-colors",
              activeId === c.id ? "bg-brand-tint" : "hover:bg-bg"
            )}
          >
            <Avatar name={c.otherParty?.fullName ?? "PhoneBay User"} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink text-sm truncate">{c.otherParty?.fullName ?? "PhoneBay User"}</p>
                <span className="text-[11px] text-ink-faint shrink-0">{c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleDateString() : "New"}</span>
              </div>
              <p className="text-xs text-ink-faint truncate">{c.listingId ?? "General chat"}</p>
              <p className="text-sm text-ink-soft truncate mt-0.5">{c.lastMessage?.text ?? "Start a conversation"}</p>
            </div>
            {c.unreadCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-brand text-white text-[11px] flex items-center justify-center shrink-0">
                {c.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col", !showThreadMobile && "hidden lg:flex")}>
        {active ? (
          <>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="lg:hidden h-8 w-8 flex items-center justify-center -ml-1"
                  onClick={() => setShowThreadMobile(false)}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <Avatar name={active.otherParty?.fullName ?? "PhoneBay User"} size="sm" />
                <div className="min-w-0">
                  <p className="font-medium text-ink text-sm truncate">{active.otherParty?.fullName ?? "PhoneBay User"}</p>
                  <p className="text-xs text-ink-faint">{active.listingId ? `Listing ${active.listingId}` : "Marketplace chat"}</p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-bg"
                aria-label="Call user"
                onClick={() => {
                  const phone = active.otherParty?.id ? "+92 300 0000000" : "+92 300 0000000";
                  window.location.href = `tel:${phone}`;
                }}
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m) => {
                const isMine = currentUserId !== null && m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[75%] rounded-[var(--pb-radius-md)] px-3.5 py-2.5 text-sm",
                      isMine ? "self-end bg-brand text-white" : "self-start bg-bg text-ink"
                    )}
                  >
                    {m.text}
                    <p className={cn("text-[10px] mt-1", isMine ? "text-white/60" : "text-ink-faint")}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })}
            </div>

            <form
              className="flex items-center gap-2.5 p-3.5 border-t border-border"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message"
                aria-label="Message"
                className="flex-1 h-10 rounded-full border border-border-strong px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/25 focus:border-brand"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0 disabled:opacity-50"
                disabled={!draft.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink-faint text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
