import type { Metadata } from "next";
import { MessagesInbox } from "@/components/dashboard/MessagesInbox";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Messages</h1>
      <p className="text-ink-soft mt-1 mb-6">Conversations with buyers and sellers.</p>
      <MessagesInbox />
    </div>
  );
}
