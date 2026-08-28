"use client";

import * as React from "react";
import { Send, ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { conversations as initialConversations, type Conversation } from "@/data/messages";

export function MessagesInbox() {
  const [conversations, setConversations] = React.useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = React.useState(conversations[0]?.id);
  const [draft, setDraft] = React.useState("");
  const [showThreadMobile, setShowThreadMobile] = React.useState(false);

  const active = conversations.find((c) => c.id === activeId);

  const sendMessage = () => {
    if (!draft.trim() || !active) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              lastMessage: draft,
              messages: [...c.messages, { id: `m${Date.now()}`, from: "me", text: draft, time: "Now" }],
            }
          : c
      )
    );
    setDraft("");
  };

  return (
    <div className="border border-border rounded-[var(--pb-radius-lg)] overflow-hidden h-[calc(100vh-220px)] min-h-[420px] grid lg:grid-cols-[320px_1fr]">
      <div className={cn("border-r border-border overflow-y-auto", showThreadMobile && "hidden lg:block")}>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveId(c.id);
              setShowThreadMobile(true);
              setConversations((prev) => prev.map((p) => (p.id === c.id ? { ...p, unread: 0 } : p)));
            }}
            className={cn(
              "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-border transition-colors",
              activeId === c.id ? "bg-brand-tint" : "hover:bg-bg"
            )}
          >
            <Avatar name={c.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink text-sm truncate">{c.name}</p>
                <span className="text-[11px] text-ink-faint shrink-0">{c.time}</span>
              </div>
              <p className="text-xs text-ink-faint truncate">{c.device}</p>
              <p className="text-sm text-ink-soft truncate mt-0.5">{c.lastMessage}</p>
            </div>
            {c.unread > 0 && (
              <span className="h-5 w-5 rounded-full bg-brand text-white text-[11px] flex items-center justify-center shrink-0">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col", !showThreadMobile && "hidden lg:flex")}>
        {active ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <button
                className="lg:hidden h-8 w-8 flex items-center justify-center -ml-1"
                onClick={() => setShowThreadMobile(false)}
                aria-label="Back to conversations"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Avatar name={active.name} size="sm" />
              <div>
                <p className="font-medium text-ink text-sm">{active.name}</p>
                <p className="text-xs text-ink-faint">{active.device}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("max-w-[75%] rounded-[var(--pb-radius-md)] px-3.5 py-2.5 text-sm", m.from === "me" ? "self-end bg-brand text-white" : "self-start bg-bg text-ink")}
                >
                  {m.text}
                  <p className={cn("text-[10px] mt-1", m.from === "me" ? "text-white/60" : "text-ink-faint")}>{m.time}</p>
                </div>
              ))}
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
