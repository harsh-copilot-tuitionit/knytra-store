import { NextRequest } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

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

function serialise(id: string, data: FirebaseFirestore.DocumentData, createdAt?: Timestamp) {
  return {
    id,
    name:      data.name      ?? "",
    phone:     data.phone     ?? "",
    line1:     data.line1     ?? "",
    line2:     data.line2     ?? "",
    city:      data.city      ?? "",
    state:     data.state     ?? "",
    pincode:   data.pincode   ?? "",
    country:   data.country   ?? "India",
    isDefault: data.isDefault ?? false,
    createdAt: (createdAt ?? data.createdAt as Timestamp)?.toMillis?.() ?? null,
    updatedAt: (data.updatedAt as Timestamp)?.toMillis?.() ?? null,
  };
}

// ── PUT /api/addresses/[id] ────────────────────────────────────────────────
// Updates an existing address. If isDefault=true → atomically unsets others.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { uid } = auth;
  const { id }  = await params;

  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
    return Response.json({ error: "Invalid address ID." }, { status: 400 });
  }

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
    const docRef = colRef.doc(id);

    const snap = await docRef.get();
    if (!snap.exists) {
      return Response.json({ error: "Address not found." }, { status: 404 });
    }

    // Duplicate check — same normalised line1 + pincode as a different address.
    const dupSnap    = await colRef.where("pincode", "==", pincode).get();
    const normLine1  = line1.toLowerCase().replace(/\s+/g, " ");
    const duplicate  = dupSnap.docs.find(d => {
      if (d.id === id) return false; // exclude self
      const dl1 = (d.data().line1 as string ?? "").toLowerCase().replace(/\s+/g, " ");
      return dl1 === normLine1;
    });
    if (duplicate) {
      return Response.json(
        { error: "This address already exists in your address book." },
        { status: 409 },
      );
    }

    const now         = Timestamp.now();
    const makeDefault = isDefault === true;
    const updatedData = {
      name, phone, line1, line2, city, state, pincode,
      country:   "India",
      isDefault: makeDefault,
      updatedAt: now,
    };

    if (makeDefault) {
      // Unset all other defaults atomically
      const defaultsSnap = await colRef.where("isDefault", "==", true).get();
      const batch = db.batch();
      defaultsSnap.docs
        .filter(d => d.id !== id)
        .forEach(d => batch.update(d.ref, { isDefault: false, updatedAt: now }));
      batch.update(docRef, updatedData);
      await batch.commit();
    } else {
      await docRef.update(updatedData);
    }

    return Response.json(serialise(id, updatedData, snap.data()!.createdAt as Timestamp));
  } catch (err) {
    console.error("[PUT /api/addresses/:id]", err);
    return Response.json({ error: "Failed to update address." }, { status: 500 });
  }
}

// ── DELETE /api/addresses/[id] ─────────────────────────────────────────────
// Deletes an address. If it was the default → auto-promotes the most recent
// remaining address to default, atomically in the same batch.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { uid } = auth;
  const { id }  = await params;

  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
    return Response.json({ error: "Invalid address ID." }, { status: 400 });
  }

  try {
    const db     = getAdminDb();
    const colRef = db.collection("users").doc(uid).collection("addresses");
    const docRef = colRef.doc(id);

    const snap = await docRef.get();
    if (!snap.exists) {
      return Response.json({ error: "Address not found." }, { status: 404 });
    }

    const wasDefault = snap.data()!.isDefault === true;
    const batch      = db.batch();
    batch.delete(docRef);

    if (wasDefault) {
      // Find the most recent OTHER address to promote.
      // Fetch limit(2) in case Firestore returns the doc being deleted;
      // find the first result whose ID differs from the one we're removing.
      const nextSnap = await colRef.orderBy("createdAt", "desc").limit(2).get();
      const nextDoc  = nextSnap.docs.find(d => d.id !== id);
      if (nextDoc) {
        // Promote in the same batch — delete + promote are atomic.
        batch.update(nextDoc.ref, { isDefault: true, updatedAt: Timestamp.now() });
      }
    }

    await batch.commit();
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/addresses/:id]", err);
    return Response.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
