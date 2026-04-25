import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { getApplicationById, updateApplication } from "@/lib/ats/application-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const application = await getApplicationById(id);
    if (!application) {
      return Response.json({ error: "Application not found." }, { status: 404 });
    }
    return Response.json(application);
  } catch (error) {
    console.error("[GET /api/careers/applications/id]", error);
    return Response.json(
      { error: "Failed to fetch application." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const application = await updateApplication(id, {
      stage: body.stage,
      note: body.note,
      evaluation: body.evaluation,
      candidate: body.candidate,
      author: session.uid,
    });

    if (!application) {
      return Response.json({ error: "Application not found." }, { status: 404 });
    }

    return Response.json({ application });
  } catch (error) {
    console.error("[PUT /api/careers/applications/id]", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update application.",
      },
      { status: 500 },
    );
  }
}
