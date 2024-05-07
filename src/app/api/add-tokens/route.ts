import { Creator, Token, Wallet } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import {
  ADD_CREATORS,
  ADD_TOKENS,
  ADD_WALLETS,
  GET_WALLETS_BY_ADDRESSES,
} from "@the-architects/blueprint-graphql";
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

  let tokensWithIds: Token[] = [];

  try {
    const {
      insert_tokens: insertedTokens,
    }: {
      insert_tokens: { affected_rows: number; returning: { id: string }[] };
    } = await client.request(ADD_TOKENS, {
      tokens,
    });

    const insertedTokenIds = insertedTokens.returning.map(({ id }) => id);

    tokensWithIds = tokens.map((token: Token, i: number) => ({
      ...token,
      id: insertedTokenIds[i],
    }));

    if (insertedTokens.affected_rows !== tokens.length) {
      return NextResponse.json(
        { error: "There was an unexpected error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  for (const token of tokensWithIds) {
    let addedCreators: { id: string }[] = [];
    const newCreators = token?.creators_deprecated;

    if (newCreators?.length) {
      try {
        console.log("@@@@@@@ adding creators");
        console.log(JSON.stringify(token));

        const { wallets }: { wallets: Wallet[] } = await client.request({
          document: GET_WALLETS_BY_ADDRESSES,
          variables: {
            addresses: newCreators.map((creator: Creator) => creator.address),
          },
        });

        // add wallets that don't exist
        const walletsToAdd = newCreators
          .filter((_, i: number) => !wallets[i])
          .map((creator: Creator) => ({ address: creator.address }));

        if (walletsToAdd.length) {
          const {
            insert_wallets,
          }: { insert_wallets: { returning: Wallet[] } } = await client.request(
            {
              document: ADD_WALLETS,
              variables: {
                wallets: walletsToAdd.map((wallet: Wallet) => ({
                  address: wallet.address,
                })),
              },
            }
          );
          wallets.push(...insert_wallets.returning);
        }

        const {
          insert_creators,
        }: { insert_creators: { returning: { id: string }[] } } =
          await client.request(ADD_CREATORS, {
            creators: newCreators.map(
              ({ share, sortOrder }: Creator, i: number) => ({
                walletId: wallets[i].id,
                share,
                tokenId: token.id,
                sortOrder,
              })
            ),
          });
        addedCreators = insert_creators.returning;

        console.log("@@@@@@@ added creators");
        console.log({ addedCreators });
      } catch (error) {
        console.error(error as Error);
        return NextResponse.json(
          {
            message: "Error adding creators",
            error: JSON.stringify(error),
          },
          { status: 500 }
        );
      }
    }
  }

  try {
    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}
