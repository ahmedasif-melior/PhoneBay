export interface Order {
  id: string;
  device: string;
  image: string;
  price: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  seller: string;
  buyer: string;
  protected: boolean;
}

export const orders: Order[] = [
  {
    id: "PB-ORD-48213",
    device: "iPhone 15 Pro · 256GB",
    image: "/images/phones/iphone-15-pro.svg",
    price: 150000,
    status: "delivered",
    date: "2026-08-12",
    seller: "Ahmed Mobile Store",
    buyer: "You",
    protected: true,
  },
  {
    id: "PB-ORD-48915",
    device: "Galaxy S23 · 256GB",
    image: "/images/phones/galaxy-s23.svg",
    price: 92000,
    status: "shipped",
    date: "2026-08-21",
    seller: "Bilal Hassan",
    buyer: "You",
    protected: true,
  },
];
