export interface TestResult {
  label: string;
  status: "pass" | "fail";
}

export interface Phone {
  id: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: "Excellent" | "Good" | "Fair";
  price: number;
  negotiable: boolean;
  location: string;
  image: string;
  images: string[];
  verified: boolean;
  score: number;
  batteryHealth: number;
  sellerId: string;
  sellerType: "individual" | "shop";
  views: number;
  messages: number;
  saved: boolean;
  status: "active" | "pending" | "sold" | "draft" | "paused";
  postedDate: string;
  description: string;
  specs: { label: string; value: string }[];
  testResults: TestResult[];
  certificateId?: string;
}

export const phones: Phone[] = [
  {
    id: "iphone-15-pro-256-islamabad",
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: "256GB",
    color: "Natural Titanium",
    condition: "Excellent",
    price: 150000,
    negotiable: true,
    location: "Islamabad",
    image: "/images/phones/iphone-15-pro.svg",
    images: ["/images/phones/iphone-15-pro.svg", "/images/phones/iphone-15-pro.svg"],
    verified: true,
    score: 9.1,
    batteryHealth: 91,
    sellerId: "ahmed-mobile-store",
    sellerType: "shop",
    views: 842,
    messages: 23,
    saved: false,
    status: "active",
    postedDate: "2026-08-22",
    description:
      "Selling my iPhone 15 Pro in excellent condition. Always used with a case and tempered glass. No scratches or dents. Comes with original box, charger cable, and unused EarPods. Battery health verified at 91%.",
    specs: [
      { label: "Display", value: "6.1\" Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Storage", value: "256GB" },
      { label: "Camera", value: "48MP Triple System" },
      { label: "Battery", value: "3,274 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [
      { label: "Display", status: "pass" },
      { label: "Touch", status: "pass" },
      { label: "Face ID", status: "pass" },
      { label: "Camera", status: "pass" },
      { label: "Front Camera", status: "pass" },
      { label: "Speaker", status: "pass" },
      { label: "Microphone", status: "pass" },
      { label: "Charging", status: "pass" },
      { label: "Wi-Fi", status: "pass" },
      { label: "Bluetooth", status: "pass" },
      { label: "GPS", status: "pass" },
      { label: "Buttons", status: "pass" },
    ],
    certificateId: "PB-829182",
  },
  {
    id: "iphone-14-128-lahore",
    brand: "Apple",
    model: "iPhone 14",
    storage: "128GB",
    color: "Midnight",
    condition: "Good",
    price: 105000,
    negotiable: true,
    location: "Lahore",
    image: "/images/phones/iphone-14.svg",
    images: ["/images/phones/iphone-14.svg"],
    verified: true,
    score: 8.4,
    batteryHealth: 86,
    sellerId: "sana-tariq",
    sellerType: "individual",
    views: 511,
    messages: 14,
    saved: false,
    status: "active",
    postedDate: "2026-08-19",
    description:
      "iPhone 14 in good working condition. Minor signs of use on the frame, screen is flawless. Selling because I upgraded. Battery health 86%.",
    specs: [
      { label: "Display", value: "6.1\" Super Retina XDR" },
      { label: "Chip", value: "A15 Bionic" },
      { label: "Storage", value: "128GB" },
      { label: "Camera", value: "12MP Dual System" },
      { label: "Battery", value: "3,279 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [
      { label: "Display", status: "pass" },
      { label: "Touch", status: "pass" },
      { label: "Face ID", status: "pass" },
      { label: "Camera", status: "pass" },
      { label: "Front Camera", status: "pass" },
      { label: "Speaker", status: "pass" },
      { label: "Microphone", status: "pass" },
      { label: "Charging", status: "pass" },
      { label: "Wi-Fi", status: "pass" },
      { label: "Bluetooth", status: "pass" },
      { label: "GPS", status: "pass" },
      { label: "Buttons", status: "pass" },
    ],
    certificateId: "PB-771290",
  },
  {
    id: "galaxy-s24-256-karachi",
    brand: "Samsung",
    model: "Galaxy S24",
    storage: "256GB",
    color: "Onyx Black",
    condition: "Excellent",
    price: 128000,
    negotiable: false,
    location: "Karachi",
    image: "/images/phones/galaxy-s24.svg",
    images: ["/images/phones/galaxy-s24.svg"],
    verified: true,
    score: 9.4,
    batteryHealth: 96,
    sellerId: "karachi-mobile-hub",
    sellerType: "shop",
    views: 693,
    messages: 19,
    saved: true,
    status: "active",
    postedDate: "2026-08-24",
    description:
      "Brand-condition Galaxy S24 with barely any usage. Comes with box and charger. Fixed price, verified by PhoneBay technician.",
    specs: [
      { label: "Display", value: "6.2\" Dynamic AMOLED 2X" },
      { label: "Chip", value: "Snapdragon 8 Gen 3" },
      { label: "Storage", value: "256GB" },
      { label: "Camera", value: "50MP Triple System" },
      { label: "Battery", value: "4,000 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [
      { label: "Display", status: "pass" },
      { label: "Touch", status: "pass" },
      { label: "Camera", status: "pass" },
      { label: "Front Camera", status: "pass" },
      { label: "Speaker", status: "pass" },
      { label: "Microphone", status: "pass" },
      { label: "Charging", status: "pass" },
      { label: "Wi-Fi", status: "pass" },
      { label: "Bluetooth", status: "pass" },
      { label: "GPS", status: "pass" },
      { label: "Buttons", status: "pass" },
    ],
    certificateId: "PB-664521",
  },
  {
    id: "galaxy-s23-256-rawalpindi",
    brand: "Samsung",
    model: "Galaxy S23",
    storage: "256GB",
    color: "Cream",
    condition: "Good",
    price: 92000,
    negotiable: true,
    location: "Rawalpindi",
    image: "/images/phones/galaxy-s23.svg",
    images: ["/images/phones/galaxy-s23.svg"],
    verified: false,
    score: 7.8,
    batteryHealth: 84,
    sellerId: "bilal-hassan",
    sellerType: "individual",
    views: 289,
    messages: 7,
    saved: false,
    status: "active",
    postedDate: "2026-08-15",
    description: "Well maintained Galaxy S23. Small scuff on the frame, screen is perfect. Open to verification on request.",
    specs: [
      { label: "Display", value: "6.1\" Dynamic AMOLED 2X" },
      { label: "Chip", value: "Snapdragon 8 Gen 2" },
      { label: "Storage", value: "256GB" },
      { label: "Camera", value: "50MP Triple System" },
      { label: "Battery", value: "3,900 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [],
  },
  {
    id: "pixel-9-128-islamabad",
    brand: "Google",
    model: "Pixel 9",
    storage: "128GB",
    color: "Obsidian",
    condition: "Excellent",
    price: 118000,
    negotiable: true,
    location: "Islamabad",
    image: "/images/phones/pixel-9.svg",
    images: ["/images/phones/pixel-9.svg"],
    verified: true,
    score: 8.9,
    batteryHealth: 93,
    sellerId: "ahmed-mobile-store",
    sellerType: "shop",
    views: 402,
    messages: 11,
    saved: false,
    status: "active",
    postedDate: "2026-08-21",
    description: "Pixel 9 with clean camera, no dust or scratches. Comes with box and cable. Verified condition report available.",
    specs: [
      { label: "Display", value: "6.3\" Actua Display" },
      { label: "Chip", value: "Google Tensor G4" },
      { label: "Storage", value: "128GB" },
      { label: "Camera", value: "50MP Dual System" },
      { label: "Battery", value: "4,700 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [
      { label: "Display", status: "pass" },
      { label: "Touch", status: "pass" },
      { label: "Camera", status: "pass" },
      { label: "Front Camera", status: "pass" },
      { label: "Speaker", status: "pass" },
      { label: "Microphone", status: "pass" },
      { label: "Charging", status: "pass" },
      { label: "Wi-Fi", status: "pass" },
      { label: "Bluetooth", status: "pass" },
      { label: "GPS", status: "pass" },
      { label: "Buttons", status: "pass" },
    ],
    certificateId: "PB-902341",
  },
  {
    id: "oneplus-13-256-lahore",
    brand: "OnePlus",
    model: "OnePlus 13",
    storage: "256GB",
    color: "Midnight Ocean",
    condition: "Excellent",
    price: 135000,
    negotiable: false,
    location: "Lahore",
    image: "/images/phones/oneplus-13.svg",
    images: ["/images/phones/oneplus-13.svg"],
    verified: true,
    score: 9.0,
    batteryHealth: 97,
    sellerId: "lahore-phone-gallery",
    sellerType: "shop",
    views: 356,
    messages: 9,
    saved: false,
    status: "active",
    postedDate: "2026-08-25",
    description: "Latest OnePlus 13, near-new condition with Hasselblad camera system. Full box contents included.",
    specs: [
      { label: "Display", value: "6.82\" LTPO AMOLED" },
      { label: "Chip", value: "Snapdragon 8 Elite" },
      { label: "Storage", value: "256GB" },
      { label: "Camera", value: "50MP Triple Hasselblad" },
      { label: "Battery", value: "6,000 mAh" },
      { label: "5G", value: "Yes" },
    ],
    testResults: [
      { label: "Display", status: "pass" },
      { label: "Touch", status: "pass" },
      { label: "Camera", status: "pass" },
      { label: "Front Camera", status: "pass" },
      { label: "Speaker", status: "pass" },
      { label: "Microphone", status: "pass" },
      { label: "Charging", status: "pass" },
      { label: "Wi-Fi", status: "pass" },
      { label: "Bluetooth", status: "pass" },
      { label: "GPS", status: "pass" },
      { label: "Buttons", status: "pass" },
    ],
    certificateId: "PB-118804",
  },
];

export function getPhoneById(id: string) {
  return phones.find((p) => p.id === id);
}

export const brands = ["Apple", "Samsung", "Google", "OnePlus"];
export const conditions = ["Excellent", "Good", "Fair"];
export const locations = ["Islamabad", "Lahore", "Karachi", "Rawalpindi"];
