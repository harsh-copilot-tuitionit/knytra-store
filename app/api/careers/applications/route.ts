import { NextRequest } from "next/server";
import { createApplication, getApplications } from "@/lib/ats/service";
import { getSessionFromRequest } from "@/lib/careers-auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const jobId = url.searchParams.get("jobId") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const stage = url.searchParams.get("stage") ?? undefined;

    const applications = await getApplications({
      status: status as any,
      jobId,
      search,
      stage: stage as any,
    });

    return Response.json({ applications });
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
