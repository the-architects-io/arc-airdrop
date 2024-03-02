import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UploadJob } from "@/app/blueprint/types";
import { UPDATE_UPLOAD_JOB } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";

export async function POST(req: NextRequest) {
  const {
    id,
    isComplete,
    log,
    percentComplete,
    sizeInBytes,
    statusId,
    statusText,
    driveAddress,
    fileCount,
    icon,
    cluster,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log({
    id,
    isComplete,
    log,
    percentComplete,
    sizeInBytes,
    statusId,
    statusText,
    driveAddress,
    fileCount,
    icon,
    cluster,
  });

  try {
    const {
      update_uploadJobs_by_pk: updatedJob,
    }: { update_uploadJobs_by_pk: UploadJob } = await client.request(
      UPDATE_UPLOAD_JOB,
      {
        id,
        job: {
          ...(isComplete && { isComplete }),
          ...(log && { log }),
          ...(percentComplete && { percentComplete }),
          ...(sizeInBytes && { sizeInBytes }),
          ...(statusId && { statusId }),
          ...(statusText && { statusText }),
          ...(driveAddress && { driveAddress }),
          ...(fileCount && { fileCount }),
          ...(icon && { icon }),
          ...(cluster && { cluster }),
        },
      }
    );

    console.log({ updatedJob });

    if (!updatedJob) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    const { data } = await axios.post(`${BASE_URL}/api/report-job`, {
      job: updatedJob,
      metadata: {
        context: "frontend",
        cluster,
      },
    });

    return NextResponse.json({ job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("update-upload-job error", error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
