import { Collection, Creator, Wallet } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import {
  ADD_CREATORS,
  ADD_WALLETS,
  UPDATE_COLLECTION,
  GET_WALLETS_BY_ADDRESSES,
} from "@the-architects/blueprint-graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    imageUrl,
    id,
    name,
    symbol,
    description,
    sellerFeeBasisPoints,
    creators,
    driveAddress,
    isReadyToMint,
    uploadJobId,
    merkleTreeAddress,
    collectionNftAddress,
    tokenCount,
    imageSizeInBytes,
    maxDepth,
    maxBufferSize,
    canopyDepth,
    collectionBuildSourceId,
    tokenImagesSizeInBytes,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log({ creators });

  let addedCreators;
  if (creators?.length) {
    try {
      console.log("@@@@@@@ adding creators");

      const { wallets }: { wallets: Wallet[] } = await client.request({
        document: GET_WALLETS_BY_ADDRESSES,
        variables: {
          addresses: creators.map((creator: Creator) => creator.address),
        },
      });

      // add wallets that don't exist
      const walletsToAdd = creators.filter(
        (creator: Creator, i: number) => !wallets[i]
      );

      if (walletsToAdd.length) {
        const { insert_wallets }: { insert_wallets: { returning: Wallet[] } } =
          await client.request({
            document: ADD_WALLETS,
            variables: {
              wallets: walletsToAdd.map((wallet: Wallet) => ({
                address: wallet.address,
              })),
            },
          });
        wallets.push(...insert_wallets.returning);
      }

      const {
        insert_creators,
      }: { insert_creators: { returning: { id: string }[] } } =
        await client.request(ADD_CREATORS, {
          creators: creators.map(
            ({ share, sortOrder }: Creator, i: number) => ({
              walletId: wallets[i].id,
              share,
              collectionId: id,
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

  let updatedCollection;
  try {
    const {
      update_collections_by_pk,
    }: { update_collections_by_pk: Collection } = await client.request(
      UPDATE_COLLECTION,
      {
        id,
        collection: {
          ...(imageUrl && { imageUrl }),
          ...(name && { name }),
          ...(symbol && { symbol }),
          ...(description && { description }),
          ...(sellerFeeBasisPoints && { sellerFeeBasisPoints }),
          ...(isReadyToMint && { isReadyToMint }),
          ...(driveAddress && { driveAddress }),
          ...(uploadJobId && { uploadJobId }),
          ...(collectionNftAddress && { collectionNftAddress }),
          ...(merkleTreeAddress && { merkleTreeAddress }),
          ...(tokenCount && { tokenCount }),
          ...(imageSizeInBytes && { imageSizeInBytes }),
          ...(maxDepth && { maxDepth }),
          ...(maxBufferSize && { maxBufferSize }),
          ...(canopyDepth !== undefined && { canopyDepth: canopyDepth }),
          ...(collectionBuildSourceId && { collectionBuildSourceId }),
          ...(tokenImagesSizeInBytes && { tokenImagesSizeInBytes }),
        },
      }
    );
    updatedCollection = update_collections_by_pk;
  } catch (error) {
    console.error(error as Error);
    return NextResponse.json(
      { error: "Error updating collection" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Collection updated",
      collection: {
        ...updatedCollection,
        creators: addedCreators,
      },
    },
    { status: 200 }
  );
}
