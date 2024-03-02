import { ARCHITECTS_API_URL } from "@/constants/constants";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { job, metadata } = await req.json();

  const { data } = await axios.post(`${ARCHITECTS_API_URL}/report-job`, {
    job,
    metadata,
  });

  return NextResponse.json(
    {
      ...data,
      job,
      metadata,
    },
    { status: 200 }
  );
}
