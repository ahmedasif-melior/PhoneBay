export interface Certificate {
  id: string;
  device: string;
  storage: string;
  overallScore: number;
  batteryHealth: number;
  display: number;
  camera: number;
  performance: number;
  physicalCondition: number;
  testedBy: string;
  issued: string;
  validUntil: string;
}

export const certificates: Certificate[] = [
  {
    id: "PB-829182",
    device: "iPhone 15 Pro",
    storage: "256GB",
    overallScore: 9.1,
    batteryHealth: 91,
    display: 9.3,
    camera: 9.2,
    performance: 9.1,
    physicalCondition: 8.9,
    testedBy: "PhoneBay Verified Partner — Ahmed Mobile Store",
    issued: "2026-08-27",
    validUntil: "2026-09-27",
  },
];

export interface PassportEvent {
  date: string;
  event: string;
  provider: string;
  status: "completed" | "in_progress";
}

export const passportTimeline: PassportEvent[] = [
  { date: "2026-01-14", event: "Device registered", provider: "PhoneBay", status: "completed" },
  { date: "2026-03-02", event: "Professional verification", provider: "Ahmed Mobile Store", status: "completed" },
  { date: "2026-05-19", event: "Repair recorded — battery replacement", provider: "PhoneBay Certified Repair", status: "completed" },
  { date: "2026-06-30", event: "Device re-tested", provider: "Ahmed Mobile Store", status: "completed" },
  { date: "2026-08-22", event: "Listed on PhoneBay", provider: "PhoneBay Marketplace", status: "completed" },
];

export interface VerificationJob {
  id: string;
  device: string;
  customer: string;
  requestedOn: string;
  status: "pending" | "in_progress" | "completed";
  score?: number;
}

export const verificationJobs: VerificationJob[] = [
  { id: "VJ-1042", device: "iPhone 13", customer: "Fatima Sheikh", requestedOn: "2026-08-27", status: "pending" },
  { id: "VJ-1041", device: "Galaxy A54", customer: "Hamza Iqbal", requestedOn: "2026-08-27", status: "pending" },
  { id: "VJ-1039", device: "iPhone 15", customer: "Noor ul Ain", requestedOn: "2026-08-26", status: "in_progress" },
  { id: "VJ-1035", device: "Pixel 8", customer: "Danish Raza", requestedOn: "2026-08-25", status: "completed", score: 8.6 },
  { id: "VJ-1031", device: "iPhone 14 Pro", customer: "Mehak Fatima", requestedOn: "2026-08-24", status: "completed", score: 9.0 },
];
