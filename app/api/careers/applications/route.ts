import { NextRequest } from "next/server";
import { createApplication, getApplicationsPage, hasApplicationEmailBeenSent, logApplicationEmail } from "@/lib/ats/service";
import { sendCareerEmail } from "@/lib/email/career-email-service";
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

    // --- Automatic Application Received Email ---
    let emailResult: { attempted: boolean; success?: boolean; type?: string } | undefined = undefined;
    try {
      const appId = result?.id;
      if (appId && !(await hasApplicationEmailBeenSent(appId, "application_received"))) {
        const log = await sendCareerEmail({
          to: body.email,
          type: "application_received",
          candidateName: body.fullName,
          jobTitle: body.role?.jobTitle,
          sentBy: "system",
        });
        if (log.success) {
          await logApplicationEmail(appId, log);
          emailResult = { attempted: true, success: true, type: "application_received" };
        } else {
          emailResult = { attempted: true, success: false };
        }
      }
    } catch (err) {
      // Log error server-side, do not expose to client
      console.error("[Application Received Email]", err);
      emailResult = { attempted: true, success: false };
    }

    if (emailResult) {
      return Response.json({ ...result, email: emailResult }, { status: 201 });
    }
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
