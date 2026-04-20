import { getAnalyticsOverview } from "@/lib/ats/service";

export async function GET() {
  try {
    const summary = await getAnalyticsOverview();
    return Response.json({ summary });
  } catch (error) {
    console.error("[GET /api/careers/ats/summary]", error);
    return Response.json(
      { error: "Failed to load ATS summary." },
      { status: 500 },
    );
  }
}
