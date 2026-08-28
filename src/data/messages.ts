export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  device: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Ahmed Mobile Store",
    device: "iPhone 15 Pro · 256GB",
    lastMessage: "Yes, it's still available. Would you like to see the certificate?",
    time: "10:42 AM",
    unread: 2,
    messages: [
      { id: "m1", from: "me", text: "Hi, is the iPhone 15 Pro still available?", time: "10:38 AM" },
      { id: "m2", from: "them", text: "Yes, it's still available. Would you like to see the certificate?", time: "10:42 AM" },
    ],
  },
  {
    id: "c2",
    name: "Sana Tariq",
    device: "iPhone 14 · 128GB",
    lastMessage: "Sure, I can do Rs. 100,000 if you can pick up today.",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: "m3", from: "me", text: "Would you accept Rs. 100,000?", time: "Yesterday" },
      { id: "m4", from: "them", text: "Sure, I can do Rs. 100,000 if you can pick up today.", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    name: "Karachi Mobile Hub",
    device: "Galaxy S24 · 256GB",
    lastMessage: "Thanks for your order! We'll ship it tomorrow.",
    time: "Mon",
    unread: 0,
    messages: [
      { id: "m5", from: "them", text: "Thanks for your order! We'll ship it tomorrow.", time: "Mon" },
    ],
  },
];
