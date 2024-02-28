import { Token } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_TOKENS } from "@the-architects/blueprint-graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    tokens,
    cluster,
  }: {
    tokens: Token[];
    cluster: "devnet" | "mainnet-beta";
  } = await req.json();

  if (!tokens.length) {
    return NextResponse.json({ error: "Invalid args" }, { status: 400 });
  }

  if (cluster) {
    tokens.forEach((token) => {
      token.cluster = cluster;
    });
  }

  try {
    const {
      insert_tokens: insertedTokens,
    }: { insert_tokens: { affected_rows: number } } = await client.request(
      ADD_TOKENS,
      {
        tokens,
      }
    );

    if (insertedTokens.affected_rows !== tokens.length) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
