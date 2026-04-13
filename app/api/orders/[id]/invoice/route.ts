import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

// ── helpers ────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── PDF builder ────────────────────────────────────────────────────────────

function buildPdf(order: {
  id: string;
  createdAt: string | null;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  totalAmount: number;
  address: { name: string; phone: string; fullAddress: string; city: string; pincode: string };
  payment: { razorpay_order_id: string; razorpay_payment_id: string; status: string };
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;        // 595
    const L = 50;                    // left margin
    const R = W - 50;                // right margin

    // ── Brand header ────────────────────────────────────────────────────────
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#000000")
      .text("KNYTRA", L, 50);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#888888")
      .text("knytra.in  ·  support@knytra.com", L, 76);

    // "Invoice" label — top right
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor("#000000")
      .text("INVOICE", 0, 50, { align: "right" });

    // ── Divider ─────────────────────────────────────────────────────────────
    doc.moveTo(L, 110).lineTo(R, 110).lineWidth(1).strokeColor("#000000").stroke();

    // ── Order meta ──────────────────────────────────────────────────────────
    const shortRef = order.id.slice(-8).toUpperCase();

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#555555")
      .text(`Order Ref:`, L, 124)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`#${shortRef}`, L + 72, 124);

    doc
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Date:`, L, 140)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(formatDate(order.createdAt), L + 72, 140);

    doc
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Payment:`, L, 156)
      .font("Helvetica-Bold")
      .fillColor(order.payment.status === "success" ? "#1a7a3e" : "#cc0000")
      .text(order.payment.status === "success" ? "Paid" : order.payment.status.toUpperCase(), L + 72, 156);

    // ── Bill-to address ─────────────────────────────────────────────────────
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#888888")
      .text("BILL TO:", R - 160, 124, { width: 160, align: "right" });

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#000000")
      .text(order.address.name, R - 160, 138, { width: 160, align: "right" });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text(order.address.fullAddress, R - 160, 152, { width: 160, align: "right" })
      .text(`${order.address.city} — ${order.address.pincode}`, { width: 160, align: "right" })
      .text(order.address.phone, { width: 160, align: "right" });

    // ── Items table ─────────────────────────────────────────────────────────
    let y = 210;

    // Table header background
    doc
      .rect(L, y, R - L, 22)
      .fill("#000000");

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#ffffff");

    const colItem  = L + 8;
    const colSize  = L + 260;
    const colQty   = L + 330;
    const colPrice = L + 380;
    const colTotal = R - 8;

    doc.text("ITEM",       colItem,  y + 7);
    doc.text("SIZE",       colSize,  y + 7);
    doc.text("QTY",        colQty,   y + 7);
    doc.text("UNIT PRICE", colPrice, y + 7);
    doc.text("TOTAL",      colTotal - 40, y + 7, { width: 40, align: "right" });

    y += 22;

    // Rows
    order.items.forEach((item, i) => {
      const rowBg = i % 2 === 0 ? "#fafafa" : "#ffffff";
      doc.rect(L, y, R - L, 22).fill(rowBg);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#000000")
        .text(item.name,               colItem,       y + 7, { width: 240, ellipsis: true })
        .text(item.size,               colSize,       y + 7)
        .text(String(item.quantity),   colQty,        y + 7)
        .text(formatINR(item.price),   colPrice,      y + 7)
        .text(formatINR(item.price * item.quantity), colTotal - 60, y + 7, { width: 60, align: "right" });

      y += 22;
    });

    // ── Totals ───────────────────────────────────────────────────────────────
    y += 10;
    doc
      .moveTo(L, y).lineTo(R, y)
      .lineWidth(0.5).strokeColor("#dddddd").stroke();

    y += 12;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#000000")
      .text("Total Paid", L, y)
      .text(formatINR(order.totalAmount), 0, y, { align: "right" });

    // ── Payment ID ───────────────────────────────────────────────────────────
    if (order.payment.razorpay_payment_id) {
      y += 30;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#aaaaaa")
        .text(`Payment ID: ${order.payment.razorpay_payment_id}`, L, y);
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageBottom = doc.page.height - 50;

    doc
      .moveTo(L, pageBottom - 20)
      .lineTo(R, pageBottom - 20)
      .lineWidth(0.5).strokeColor("#dddddd").stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#aaaaaa")
      .text("Thank you for shopping with KNYTRA.", L, pageBottom - 12, {
        align: "center",
        width: R - L,
      });

    doc.end();
  });
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Order ID is required." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("orders").doc(id).get();

    if (!snap.exists) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const d = snap.data()!;
    const order = {
      id: snap.id,
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
      items:       d.items       ?? [],
      totalAmount: d.totalAmount ?? 0,
      address:     d.address     ?? {},
      payment:     d.payment     ?? {},
    };

    const pdfBuffer = await buildPdf(order);
    const shortRef  = snap.id.slice(-8).toUpperCase();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="knytra-invoice-${shortRef}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("[invoice] Error:", error);
    return Response.json({ error: "Failed to generate invoice." }, { status: 500 });
  }
}
