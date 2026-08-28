export interface Seller {
  id: string;
  name: string;
  type: "individual" | "shop";
  avatar?: string;
  rating: number;
  reviewCount: number;
  completedTransactions: number;
  memberSince: string;
  location: string;
  verified: {
    identity: boolean;
    phone: boolean;
    address: boolean;
  };
  responseTime: string;
  bio: string;
}

export const sellers: Seller[] = [
  {
    id: "ahmed-mobile-store",
    name: "Ahmed Mobile Store",
    type: "shop",
    rating: 4.9,
    reviewCount: 312,
    completedTransactions: 124,
    memberSince: "2025",
    location: "Islamabad",
    verified: { identity: true, phone: true, address: true },
    responseTime: "Usually replies within an hour",
    bio: "Trusted mobile retailer in Blue Area, Islamabad, specializing in certified pre-owned iPhones and flagship Android devices.",
  },
  {
    id: "sana-tariq",
    name: "Sana Tariq",
    type: "individual",
    rating: 4.7,
    reviewCount: 18,
    completedTransactions: 9,
    memberSince: "2026",
    location: "Lahore",
    verified: { identity: true, phone: true, address: false },
    responseTime: "Usually replies within a few hours",
    bio: "Selling my personal devices when I upgrade. Always accurate descriptions.",
  },
  {
    id: "karachi-mobile-hub",
    name: "Karachi Mobile Hub",
    type: "shop",
    rating: 4.8,
    reviewCount: 501,
    completedTransactions: 289,
    memberSince: "2024",
    location: "Karachi",
    verified: { identity: true, phone: true, address: true },
    responseTime: "Usually replies within 30 minutes",
    bio: "Saddar's largest verified phone retailer — new and professionally tested used devices with 6-month warranty.",
  },
  {
    id: "bilal-hassan",
    name: "Bilal Hassan",
    type: "individual",
    rating: 4.5,
    reviewCount: 6,
    completedTransactions: 4,
    memberSince: "2026",
    location: "Rawalpindi",
    verified: { identity: false, phone: true, address: false },
    responseTime: "Usually replies within a day",
    bio: "Occasional seller, upgrading devices every year.",
  },
  {
    id: "lahore-phone-gallery",
    name: "Lahore Phone Gallery",
    type: "shop",
    rating: 4.9,
    reviewCount: 218,
    completedTransactions: 156,
    memberSince: "2025",
    location: "Lahore",
    verified: { identity: true, phone: true, address: true },
    responseTime: "Usually replies within an hour",
    bio: "Specialists in flagship Android devices with in-house testing lab and certified repairs.",
  },
];

export function getSellerById(id: string) {
  return sellers.find((s) => s.id === id);
}

export interface Shop extends Seller {
  type: "shop";
  services: string[];
  todaysJobs: number;
  pendingTests: number;
  completedTests: number;
  averageScore: number;
  monthlyRevenue: number;
}

export const shops: Shop[] = sellers
  .filter((s): s is Seller & { type: "shop" } => s.type === "shop")
  .map((s) => ({
    ...s,
    services: ["Device Testing", "Certification", "Repairs", "Trade-In"],
    todaysJobs: 8,
    pendingTests: 3,
    completedTests: 42,
    averageScore: 8.9,
    monthlyRevenue: 84500,
  }));
