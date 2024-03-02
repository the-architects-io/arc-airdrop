import { CreateJobInput, Job } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { ADD_JOB } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    userId,
    statusText,
    statusId,
    percentComplete,
    jobTypeId,
    icon,
    cluster,
  }: CreateJobInput = await req.json();

  if (!userId || !jobTypeId) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  try {
    const { insert_jobs_one: job }: { insert_jobs_one: Job } =
      await client.request(ADD_JOB, {
        job: {
          ...(userId && { userId }),
          ...(jobTypeId && { jobTypeId }),
          ...(statusText && { statusText }),
          ...(statusId && { statusId }),
          ...(percentComplete && { percentComplete }),
          ...(icon && { icon }),
          ...(cluster && { cluster }),
        },
      });

    console.log({ job });

    const { data } = await axios.post(`${BASE_URL}/api/report-job`, {
      job,
      metadata: {
        context: "frontend",
        cluster,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error("create-job error", error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
