// https://developers.metaplex.com/bubblegum/create-trees
// maxDepth	maxBufferSize	maxNumberOfCNFTs
// 3	8	8
// 5	8	32
// 14	64	16,384
// 14	256	16,384
// 14	1,024	16,384
// 14	2,048	16,384
// 15	64	32,768
// 16	64	65,536
// 17	64	131,072
// 18	64	262,144
// 19	64	524,288
// 20	64	1,048,576
// 20	256	1,048,576
// 20	1,024	1,048,576
// 20	2,048	1,048,576
// 24	64	16,777,216
// 24	256	16,777,216
// 24	512	16,777,216
// 24	1,024	16,777,216
// 24	2,048	16,777,216
// 26	512	67,108,864
// 26	1,024	67,108,864
// 26	2,048	67,108,864
// 30	512	1,073,741,824
// 30	1,024	1,073,741,824
// 30	2,048	1,073,741,824

import {
  ALL_DEPTH_SIZE_PAIRS,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";

export const allDepthSizes = ALL_DEPTH_SIZE_PAIRS.flatMap(
  (pair) => pair.maxDepth
).filter((item, pos, self) => self.indexOf(item) == pos);

export const largestDepth = allDepthSizes[allDepthSizes.length - 1];

export const defaultDepthPair: ValidDepthSizePair = {
  maxDepth: 3,
  maxBufferSize: 8,
};

export type MaxNumberOfCnft =
  | 8
  | 32
  | 16384
  | 32768
  | 65536
  | 131072
  | 262144
  | 524288
  | 1048576
  | 16777216
  | 67108864
  | 1073741824;

export const maxNumberOfCnftsInMerkleTree = [
  8, 32, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 16777216,
  67108864, 1073741824,
];

export const isValidMaxNumberOfCnftsInMerkleTree = (
  maxNumberOfCnfts: number | string
) => {
  if (typeof maxNumberOfCnfts === "string") {
    maxNumberOfCnfts = Number(maxNumberOfCnfts);
  }

  return [
    8, 32, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 16777216,
    67108864, 1073741824,
  ].includes(maxNumberOfCnfts);
};

export const getMinimumMaxBufferSizeAndMaxDepthForCapacity = (
  capacity: number
): { maxBufferSize: number; maxDepth: number } => {
  if (capacity <= 8) {
    return { maxBufferSize: 8, maxDepth: 3 };
  }
  if (capacity <= 32) {
    return { maxBufferSize: 8, maxDepth: 5 };
  }
  if (capacity <= 16384) {
    return { maxBufferSize: 64, maxDepth: 14 };
  }
  if (capacity <= 32768) {
    return { maxBufferSize: 64, maxDepth: 15 };
  }
  if (capacity <= 65536) {
    return { maxBufferSize: 64, maxDepth: 16 };
  }
  if (capacity <= 131072) {
    return { maxBufferSize: 64, maxDepth: 17 };
  }
  if (capacity <= 262144) {
    return { maxBufferSize: 64, maxDepth: 18 };
  }
  if (capacity <= 524288) {
    return { maxBufferSize: 64, maxDepth: 19 };
  }
  if (capacity <= 1048576) {
    return { maxBufferSize: 64, maxDepth: 20 };
  }
  if (capacity <= 16777216) {
    return { maxBufferSize: 64, maxDepth: 24 };
  }
  if (capacity <= 67108864) {
    return { maxBufferSize: 512, maxDepth: 26 };
  }
  if (capacity <= 1073741824) {
    return { maxBufferSize: 512, maxDepth: 30 };
  }
  throw new Error("Invalid capacity");
};

export const getMaxCapacityFromMaxBufferSizeAndMaxDepth = (
  maxBufferSize: number,
  maxDepth: number
) => {
  if (maxBufferSize === 8 && maxDepth === 3) {
    return 8;
  }
  if (maxBufferSize === 8 && maxDepth === 5) {
    return 32;
  }
  if (maxBufferSize === 64 && maxDepth === 14) {
    return 16384;
  }
  if (maxBufferSize === 256 && maxDepth === 14) {
    return 16384;
  }
  if (maxBufferSize === 1024 && maxDepth === 14) {
    return 16384;
  }
  if (maxBufferSize === 2048 && maxDepth === 14) {
    return 16384;
  }
  if (maxBufferSize === 64 && maxDepth === 15) {
    return 32768;
  }
  if (maxBufferSize === 64 && maxDepth === 16) {
    return 65536;
  }
  if (maxBufferSize === 64 && maxDepth === 17) {
    return 131072;
  }
  if (maxBufferSize === 64 && maxDepth === 18) {
    return 262144;
  }
  if (maxBufferSize === 64 && maxDepth === 19) {
    return 524288;
  }
  if (maxBufferSize === 64 && maxDepth === 20) {
    return 1048576;
  }
  if (maxBufferSize === 256 && maxDepth === 20) {
    return 1048576;
  }
  if (maxBufferSize === 1024 && maxDepth === 20) {
    return 1048576;
  }
  if (maxBufferSize === 2048 && maxDepth === 20) {
    return 1048576;
  }
  if (maxBufferSize === 64 && maxDepth === 24) {
    return 16777216;
  }
  if (maxBufferSize === 256 && maxDepth === 24) {
    return 16777216;
  }
  if (maxBufferSize === 512 && maxDepth === 24) {
    return 16777216;
  }
  if (maxBufferSize === 1024 && maxDepth === 24) {
    return 16777216;
  }
  if (maxBufferSize === 2048 && maxDepth === 24) {
    return 16777216;
  }
  if (maxBufferSize === 512 && maxDepth === 26) {
    return 67108864;
  }
  if (maxBufferSize === 1024 && maxDepth === 26) {
    return 67108864;
  }
  if (maxBufferSize === 2048 && maxDepth === 26) {
    return 67108864;
  }
  if (maxBufferSize === 512 && maxDepth === 30) {
    return 1073741824;
  }
  if (maxBufferSize === 1024 && maxDepth === 30) {
    return 1073741824;
  }
  if (maxBufferSize === 2048 && maxDepth === 30) {
    return 1073741824;
  }
};

export const getMaxBufferSize = (maxNumberOfCnfts: MaxNumberOfCnft) => {
  if (maxNumberOfCnfts === 8) {
    return 8;
  }
  if (maxNumberOfCnfts === 32) {
    return 8;
  }
  if (maxNumberOfCnfts === 16384) {
    return 64;
  }
  if (maxNumberOfCnfts === 32768) {
    return 64;
  }
  if (maxNumberOfCnfts === 65536) {
    return 64;
  }
  if (maxNumberOfCnfts === 131072) {
    return 64;
  }
  if (maxNumberOfCnfts === 262144) {
    return 64;
  }
  if (maxNumberOfCnfts === 524288) {
    return 64;
  }
  if (maxNumberOfCnfts === 1048576) {
    return 64;
  }
  if (maxNumberOfCnfts === 16777216) {
    return 64;
  }
  if (maxNumberOfCnfts === 67108864) {
    return 512;
  }
  if (maxNumberOfCnfts === 1073741824) {
    return 512;
  }
};

export const getMaxDepth = (maxNumberOfCnfts: MaxNumberOfCnft) => {
  if (maxNumberOfCnfts === 8) {
    return 3;
  }
  if (maxNumberOfCnfts === 32) {
    return 5;
  }
  if (maxNumberOfCnfts === 16384) {
    return 14;
  }
  if (maxNumberOfCnfts === 32768) {
    return 15;
  }
  if (maxNumberOfCnfts === 65536) {
    return 16;
  }
  if (maxNumberOfCnfts === 131072) {
    return 17;
  }
  if (maxNumberOfCnfts === 262144) {
    return 18;
  }
  if (maxNumberOfCnfts === 524288) {
    return 19;
  }
  if (maxNumberOfCnfts === 1048576) {
    return 20;
  }
  if (maxNumberOfCnfts === 16777216) {
    return 24;
  }
  if (maxNumberOfCnfts === 67108864) {
    return 26;
  }
  if (maxNumberOfCnfts === 1073741824) {
    return 30;
  }
};
