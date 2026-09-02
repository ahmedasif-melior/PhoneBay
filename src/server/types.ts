export type Role = "USER" | "SHOP" | "ADMIN";
export type AccountPurpose = "buyer" | "seller" | "both" | "shop" | null;
export type ListingStatus = "active" | "pending" | "sold" | "draft" | "paused";
export type VerificationStatus = "pending" | "in_progress" | "completed";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  role: Role;
  accountPurpose: AccountPurpose;
  emailVerified: boolean;
  phoneVerified: boolean;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

export interface ListingRecord {
  id: string;
  sellerId: string;
  brand: string;
  model: string;
  storage: string;
  color: string | null;
  condition: string;
  price: number;
  negotiable: boolean;
  city: string;
  area: string | null;
  description: string | null;
  status: ListingStatus;
  batteryHealth: number | null;
  repairHistory: string | null;
  photoCount: number;
  imageUrls: string[];
  verified: boolean;
  score: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationRequestRecord {
  id: string;
  listingId: string;
  technicianId: string | null;
  status: VerificationStatus;
  requestedAt: string;
  completedAt: string | null;
  score: number | null;
  testResults: { label: string; status: "pass" | "fail" }[] | null;
}

export interface CertificateRecord {
  id: string;
  listingId: string;
  overallScore: number;
  batteryHealth: number;
  display: number;
  camera: number;
  performance: number;
  physicalCondition: number;
  testedBy: string;
  issuedAt: string;
  validUntil: string;
}

export interface OrderRecord {
  id: string;
  listingId: string;
  buyerId: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  listingId: string | null;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  authorId: string;
  targetSellerId: string;
  listingId: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}
