import { CreateUploadJobInput, UploadJob } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_UPLOAD_JOB } from "@the-architects/blueprint-graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    sizeInBytes,
    userId,
    log,
    percentComplete,
    statusText,
    statusId,
    icon,
    cluster,
  }: CreateUploadJobInput = await req.json();

  console.log({ sizeInBytes, userId });

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields",
      },
      { status: 400 }
    );
  }

  try {
    const {
      insert_uploadJobs_one: newJob,
    }: {
      insert_uploadJobs_one: UploadJob;
    } = await client.request({
      document: ADD_UPLOAD_JOB,
      variables: {
        job: {
          ...(log && { log }),
          ...(percentComplete && { percentComplete }),
          ...(sizeInBytes && { sizeInBytes }),
          ...(statusText && { statusText }),
          ...(statusId && { statusId }),
          ...(icon && { icon }),
          ...(cluster && { cluster }),
          userId,
          isComplete: false,
        },
      },
    });

    // const { data } = await axios.post(`${BASE_URL}/api/report-job`, {
    //   job: newJob,
    //   metadata: {
    //     context: "frontend",
    //     cluster,
    //   },
    // });

    return NextResponse.json(
      {
        success: true,
        job: newJob,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to create upload job", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create upload job",
      },
      { status: 500 }
    );
  }
}
