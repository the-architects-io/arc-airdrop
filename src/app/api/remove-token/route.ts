import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Airdrop } from "@/app/blueprint/types";
import { UPDATE_AIRDROP } from "@the-architects/blueprint-graphql";
import { REMOVE_TOKEN } from "@/graphql/mutations/remove-token";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set", success: false },
      { status: 500 }
    );
  }

  console.log({
    id,
  });

  try {
    const {
      delete_tokens_by_pk: deletedToken,
    }: {
      delete_tokens_by_pk: { id: string };
    } = await client.request(REMOVE_TOKEN, {
      id,
    });

    console.log({ deletedToken });

    if (!deletedToken) {
      return NextResponse.json(
        { error: "There was an unexpected error", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Token deleted",
        token: deletedToken,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error!", success: false },
      { status: 500 }
    );
  }
}
