import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  accountPurpose: z.enum(["buyer", "seller", "both", "shop"]).optional().nullable(),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
  expectedRole: z.enum(["USER", "SHOP", "ADMIN"]).optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").optional(),
  city: z.string().trim().min(1, "City is required. ").optional().nullable(),
  bio: z.string().trim().max(500, "Bio is too long.").optional().nullable(),
  accountPurpose: z.enum(["buyer", "seller", "both", "shop"]).optional().nullable(),
});

export const createListingSchema = z.object({
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  storage: z.string().trim().min(1),
  color: z.string().trim().optional().nullable(),
  condition: z.enum(["Excellent", "Good", "Fair"]),
  price: z.number().int().positive(),
  negotiable: z.boolean().default(true),
  city: z.string().trim().min(1),
  area: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  batteryHealth: z.number().int().min(0).max(100).optional().nullable(),
  repairHistory: z.string().trim().optional().nullable(),
  photoCount: z.number().int().min(0).max(12).default(0),
  imageUrls: z.array(z.string().max(3_000_000)).max(8).default([]),
  requestVerification: z.boolean().default(false),
});

export const updateListingSchema = z.object({
  price: z.number().int().positive().optional(),
  negotiable: z.boolean().optional(),
  condition: z.enum(["Excellent", "Good", "Fair"]).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["active", "pending", "sold", "draft", "paused"]).optional(),
});

export const createOrderSchema = z.object({
  listingId: z.string().min(1),
});

export const sendMessageSchema = z.object({
  listingId: z.string().optional().nullable(),
  sellerId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

export const completeVerificationSchema = z.object({
  score: z.number().min(0).max(10),
  batteryHealth: z.number().int().min(0).max(100),
  display: z.number().min(0).max(10),
  camera: z.number().min(0).max(10),
  performance: z.number().min(0).max(10),
  physicalCondition: z.number().min(0).max(10),
  testResults: z.array(z.object({ label: z.string(), status: z.enum(["pass", "fail"]) })),
});
