import { NextRequest } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_ADDRESSES = 10;

// ── Auth helper ────────────────────────────────────────────────────────────
async function requireAuth(
  req: NextRequest,
): Promise<{ uid: string } | Response> {
  const h = req.headers.get("authorization") ?? "";
  if (!h.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(h.slice(7));
    return { uid: decoded.uid };
  } catch {
    return Response.json({ error: "Invalid or expired token." }, { status: 401 });
  }
}

// ── Validation ─────────────────────────────────────────────────────────────
interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

function validate(body: unknown): { data: AddressInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const name    = typeof b.name    === "string" ? b.name.trim()                         : "";
  const phone   = typeof b.phone   === "string" ? b.phone.replace(/\D/g, "").slice(-10) : "";
  const line1   = typeof b.line1   === "string" ? b.line1.trim()                        : "";
  const line2   = typeof b.line2   === "string" ? b.line2.trim()                        : "";
  const city    = typeof b.city    === "string" ? b.city.trim()                         : "";
  const state   = typeof b.state   === "string" ? b.state.trim()                        : "";
  const pincode = String(b.pincode ?? "").trim();

  if (!name)                                return { error: "Name is required." };
  if (name.length > 100)                    return { error: "Name is too long (max 100 chars)." };
  if (!/^\d{10}$/.test(phone))              return { error: "Valid 10-digit phone number is required." };
  if (!line1)                               return { error: "Address Line 1 is required." };
  if (line1.length > 200)                   return { error: "Address Line 1 is too long (max 200 chars)." };
  if (line2.length > 200)                   return { error: "Address Line 2 is too long (max 200 chars)." };
  if (!city)                                return { error: "City is required." };
  if (city.length > 100)                    return { error: "City is too long (max 100 chars)." };
  if (!state)                               return { error: "State is required." };
  if (!pincode || !/^\d{6}$/.test(pincode)) return { error: "Valid 6-digit pincode is required." };

  return {
    data: {
      name, phone, line1, line2, city, state, pincode,
      isDefault: b.isDefault === true,
    },
  };
}

// ── Serialise Timestamps for the client ───────────────────────────────────
function serialise(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    name:        data.name        ?? "",
    phone:       data.phone       ?? "",
    line1:       data.line1       ?? "",
    line2:       data.line2       ?? "",
    city:        data.city        ?? "",
    state:       data.state       ?? "",
    pincode:     data.pincode     ?? "",
    country:     data.country     ?? "India",
    isDefault:   data.isDefault   ?? false,
    createdAt:   (data.createdAt  as Timestamp)?.toMillis?.() ?? null,
    updatedAt:   (data.updatedAt  as Timestamp)?.toMillis?.() ?? null,
  };
}

// ── GET /api/addresses ─────────────────────────────────────────────────────
// Returns all addresses for the authenticated user sorted:
//   isDefault DESC → createdAt DESC
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { uid } = auth;

  try {
    const db     = getAdminDb();
    const colRef = db.collection("users").doc(uid).collection("addresses");

    let snap: FirebaseFirestore.QuerySnapshot;
    try {
      snap = await colRef
        .orderBy("isDefault", "desc")
        .orderBy("createdAt", "desc")
        .get();
    } catch (err: unknown) {
      // Missing composite index — fall back to unordered fetch, sort in memory
      const e = err as { code?: string; message?: string };
      if (
        e?.code === "failed-precondition" ||
        e?.message?.toLowerCase().includes("index")
      ) {
        snap = await colRef.get();
      } else {
        throw err;
      }
    }

    const addresses = snap.docs.map(d => serialise(d.id, d.data()));

    // Client-side sort as fallback when index is missing
    addresses.sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });

    return Response.json({ addresses });
  } catch (err) {
    console.error("[GET /api/addresses]", err);
    return Response.json({ error: "Failed to fetch addresses." }, { status: 500 });
  }
}

// ── POST /api/addresses ────────────────────────────────────────────────────
// Creates a new address. Enforces max 10. Auto-assigns default if first address.
// If isDefault=true → atomically unsets all other defaults.
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { uid } = auth;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validate(raw);
  if ("error" in validated) {
    return Response.json({ error: validated.error }, { status: 400 });
  }
  const { name, phone, line1, line2, city, state, pincode, isDefault } = validated.data;

  try {
    const db     = getAdminDb();
    const colRef = db.collection("users").doc(uid).collection("addresses");

    // Fetch all existing — used for count check, default detection, and batch update
    const existingSnap = await colRef.get();

    if (existingSnap.size >= MAX_ADDRESSES) {
      return Response.json(
        { error: `Maximum of ${MAX_ADDRESSES} addresses allowed. Please delete one first.` },
        { status: 422 },
      );
    }

    const isFirstAddress = existingSnap.empty;
    const makeDefault    = isDefault || isFirstAddress;
    const now            = Timestamp.now();

    const docData = {
      name, phone, line1, line2, city, state, pincode,
      country:   "India",
      isDefault: makeDefault,
      createdAt: now,
      updatedAt: now,
    };

    const batch  = db.batch();
    const newRef = colRef.doc();

    if (makeDefault) {
      // Unset existing defaults atomically
      existingSnap.docs
        .filter(d => d.data().isDefault)
        .forEach(d => batch.update(d.ref, { isDefault: false, updatedAt: now }));
    }

    batch.set(newRef, docData);
    await batch.commit();

    return Response.json(serialise(newRef.id, docData), { status: 201 });
  } catch (err) {
    console.error("[POST /api/addresses]", err);
    return Response.json({ error: "Failed to save address." }, { status: 500 });
  }
}
