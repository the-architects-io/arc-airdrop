import { client } from "@/graphql/backend-client";
import { REMOVE_CREATOR } from "@/graphql/mutations/remove-creator";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
      delete_creators_by_pk: deletedCreator,
    }: {
      delete_creators_by_pk: { id: string };
    } = await client.request(REMOVE_CREATOR, {
      id,
    });

    console.log({ deletedCreator });

    if (!deletedCreator) {
      return NextResponse.json(
        { error: "There was an unexpected error", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Creator deleted",
        creator: deletedCreator,
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
