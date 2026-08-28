export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  device?: string;
}

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Usman Farooq",
    rating: 5,
    date: "2026-08-10",
    comment:
      "Exactly as described. The battery health matched the certificate and the seller met me at a public spot for a smooth handover.",
    device: "iPhone 15 Pro",
  },
  {
    id: "r2",
    author: "Hira Malik",
    rating: 5,
    date: "2026-07-28",
    comment: "Great communication and the device passport gave me real confidence before buying.",
    device: "Galaxy S24",
  },
  {
    id: "r3",
    author: "Zeeshan Ali",
    rating: 4,
    date: "2026-07-14",
    comment: "Good phone, minor scratch not mentioned in listing but still fair for the price.",
    device: "iPhone 14",
  },
  {
    id: "r4",
    author: "Ayesha Noor",
    rating: 5,
    date: "2026-06-30",
    comment: "Verified seller badge made all the difference — quick, transparent, professional.",
    device: "Pixel 9",
  },
];
