import {
  collection,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NewOrder, Order } from "@/lib/types/order";

const ORDERS_COLLECTION = "orders";

/**
 * Creates a new order in Firestore.
 * Returns the auto-generated order document ID.
 */
export async function createOrder(order: NewOrder): Promise<string> {
  const ref = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetches a single order by its Firestore document ID.
 * Returns null if the document does not exist.
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}
