import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { getAllJobs, createJob } from "@/lib/ats/service";

function isAdmin(request: NextRequest): boolean {
  return getSessionFromRequest(request.cookies) !== null;
}

export async function GET(request: NextRequest) {
  try {
    const adminAuth = isAdmin(request);
    const jobs = await getAllJobs(adminAuth);
    return Response.json({ jobs });
  } catch (error) {
    console.error("[GET /api/careers/jobs]", error);
    return Response.json(
      { error: "Failed to fetch jobs." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await createJob(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/careers/jobs]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create job." },
      { status: 500 },
    );
  }
}
