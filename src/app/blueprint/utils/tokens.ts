import { Collection, Creator, TokenMetadata } from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";
import { isValidPublicKey } from "@/utils/rpc";
import axios from "axios";

export const creatorsAreValid = (creators: Creator[] | null) => {
  if (!creators) return false;
  const shareCount = creators.reduce((acc, curr) => acc + curr.share, 0);
  const sharesEqual100 = shareCount === 100;

  return (
    creators.every((c) => !!c.address && isValidPublicKey(c.address)) &&
    creators.every((c) => c.share) &&
    sharesEqual100
  );
};

export const getPremintCollectionMetadata = async (
  collectionId: string
): Promise<TokenMetadata[]> => {
  if (!collectionId) {
    throw new Error("Invalid collectionId");
  }
  const url = `${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/${collectionId}-collection-metadatas.json`;

  const { data } = await axios.get(url);
  return data;
};

export const getCollectionAssetBaseUrlFromCollection = (
  collection: Collection
) => {
  return `${SHDW_DRIVE_BASE_URL}/${collection.driveAddress}`;
};

export const mapCollectionMetadataFromCollectionMetadataJson = (
  collectionMetadataJson: TokenMetadata[],
  driveAddress: string
): TokenMetadata[] => {
  const collectionMetadata = collectionMetadataJson as TokenMetadata[];
  return collectionMetadata.map((token) => ({
    ...token,
    image: `${SHDW_DRIVE_BASE_URL}/${driveAddress}/${token.image}`,
  }));
};
