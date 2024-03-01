import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Airdrop } from "@/app/blueprint/types";
import { UPDATE_AIRDROP } from "@the-architects/blueprint-graphql";

export async function POST(req: NextRequest) {
  const {
    id,
    name,
    collectionNftId,
    ownerId,
    startTime,
    collectionId,
    isReadyToDrop,
    shouldKickoffManually,
    jobId,
    hasBeenPaidFor,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log({
    id,
    name,
    collectionNftId,
    ownerId,
    startTime,
    collectionId,
    isReadyToDrop,
    shouldKickoffManually,
    jobId,
    hasBeenPaidFor,
  });

  try {
    const {
      update_airdrops_by_pk: updatedAirdrop,
    }: { update_airdrops_by_pk: Airdrop } = await client.request(
      UPDATE_AIRDROP,
      {
        id,
        airdrop: {
          ...(name && { name }),
          ...(collectionNftId && { collectionNftId }),
          ...(ownerId && { ownerId }),
          ...(startTime && { startTime }),
          ...(collectionId && { collectionId }),
          ...(isReadyToDrop && { isReadyToDrop }),
          ...(shouldKickoffManually && { shouldKickoffManually }),
          ...(jobId && { jobId }),
          ...(hasBeenPaidFor && { hasBeenPaidFor }),
        },
      }
    );

    console.log({ updatedAirdrop });

    if (!updatedAirdrop) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Airdrop updated",
        airdrop: updatedAirdrop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error!" },
      { status: 500 }
    );
  }
}
