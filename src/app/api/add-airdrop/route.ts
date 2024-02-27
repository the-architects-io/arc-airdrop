import { Airdrop } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_AIRDROP } from "@the-architects/blueprint-graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { collectionId, ownerId } = await req.json();

  if (!collectionId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { insert_airdrops_one: airdrop }: { insert_airdrops_one: Airdrop } =
      await client.request({
        document: ADD_AIRDROP,
        variables: {
          airdrop: {
            collectionId,
            ownerId,
          },
        },
      });

    return NextResponse.json(
      {
        message: "Airdrop added successfully",
        airdrop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      {
        error: "Error adding airdrop",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
