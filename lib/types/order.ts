import { Timestamp } from "firebase/firestore";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  qikinkCatalogSku?: string;
  qikinkProductSku?: string;
  qikinkPrintTypeId?: number;
}

export interface OrderUser {
  name: string;
  phone: string;
  email: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  pincode: string;
  city: string;
  fullAddress: string;
}

export interface OrderPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: "pending" | "success" | "failed";
}

export type OrderStatus = "placed" | "shipped" | "delivered";

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  user: OrderUser;
  address: OrderAddress;
  payment: OrderPayment;
  status: OrderStatus;
  createdAt: Timestamp;
}

// Used when writing a new order (no id yet — Firestore generates it)
export type NewOrder = Omit<Order, "id">;
