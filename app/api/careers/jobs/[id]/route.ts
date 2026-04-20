import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { getJobById, updateJob, deleteJob } from "@/lib/ats/service";

function isAdmin(request: NextRequest): boolean {
  return getSessionFromRequest(request.cookies) !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const job = await getJobById(id, isAdmin(request));
    if (!job) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }
    return Response.json(job);
  } catch (error) {
    console.error("[GET /api/careers/jobs/id]", error);
    return Response.json(
      { error: "Failed to fetch job." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = await updateJob(id, body);
    if (!updated) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/careers/jobs/id]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update job." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteJob(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/careers/jobs/id]", error);
    return Response.json(
      { error: "Failed to delete job." },
      { status: 500 },
    );
  }
}
