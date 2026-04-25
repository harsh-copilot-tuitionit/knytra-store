import { NextRequest } from "next/server";
import { createApplication, getApplicationsPage } from "@/lib/ats/service";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { APPLICATION_STAGE_ORDER } from "@/lib/types/careers";
import type { ApplicationStage } from "@/lib/types/careers";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const rawStage = url.searchParams.get("stage") ?? undefined;
    const stage = APPLICATION_STAGE_ORDER.includes(rawStage as ApplicationStage)
      ? (rawStage as ApplicationStage)
      : undefined;
    const dateFrom = url.searchParams.get("dateFrom") ?? undefined;
    const dateTo = url.searchParams.get("dateTo") ?? undefined;
    const DEFAULT_LIMIT = 20;
    const parsedLimit = parseInt(url.searchParams.get("limit") ?? "", 10);
    const parsedOffset = parseInt(url.searchParams.get("offset") ?? "", 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;
    const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;

    const result = await getApplicationsPage({
      jobId,
      search,
      stage,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    return Response.json({
      applications: result.applications,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[GET /api/careers/applications]", error);
    return Response.json(
      { error: "Failed to fetch applications." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createApplication(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/careers/applications]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application.",
      },
      { status: error instanceof Error && error.message.includes("already applied") ? 409 : 500 },
    );
  }
}
