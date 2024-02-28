import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { isPublicKey } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";

export const getAbbreviatedAddress = (
  address: string | PublicKey,
  identifierLength: number = 4
) => {
  if (!address) return "";
  // check if it's a solana public key
  if (typeof address !== "string") {
    address = address.toString();
  }

  if (!isPublicKey(address)) return "";

  if (!address) return "";
  return `${address.slice(0, identifierLength)}...${address.slice(
    address.length - identifierLength
  )}`;
};

export const formatNumberWithCommas = (num: number | string) => {
  if (typeof num === "string") num = parseFloat(num);
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const round = (num: number, decimalPlaces = 0) => {
  var p = Math.pow(10, decimalPlaces);
  var n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
};

export const getSlug = (string: string) => {
  return string.toLowerCase().split(" ").join("-");
};

export const makeNumberArray = (amountOfItems: number) => {
  return Array.from({ length: amountOfItems }, (_, index) => index + 1);
};

export const convertBytesToKilobytes = (bytes: number) => {
  return bytes / 1024;
};

export const convertBytesToMegabytes = (bytes: number) => {
  return convertBytesToKilobytes(bytes) / 1024;
};

export const convertBytesToGigabytes = (bytes: number) => {
  return convertBytesToMegabytes(bytes) / 1024;
};

export const convertBytesToTerabytes = (bytes: number) => {
  return convertBytesToGigabytes(bytes) / 1024;
};

export const convertBytesToPetabytes = (bytes: number) => {
  return convertBytesToTerabytes(bytes) / 1024;
};

export const getBestFittingStorageSizeString = (storageInBytes: number) => {
  const storageInKb = storageInBytes / 1024;
  const storageInMb = storageInKb / 1024;
  const storageInGb = storageInMb / 1024;
  const storageInTb = storageInGb / 1024;

  return storageInTb > 1
    ? `${storageInTb.toFixed(2)}TB`
    : storageInGb > 1
    ? `${storageInGb.toFixed(2)}GB`
    : storageInMb > 1
    ? `${storageInMb.toFixed(2)}MB`
    : storageInKb > 1
    ? `${storageInKb.toFixed(2)}KB`
    : `${storageInBytes}B`;
};

export const getStringFromByteArrayString = (byteArrayString: string) => {
  if (!byteArrayString?.length) return "";

  // Convert the string to an array of byte values
  const byteValues = byteArrayString.split(",").map(Number);

  // Convert the array to a Buffer
  const buffer = Buffer.from(byteValues);

  // Encode the buffer as a base58 string
  const base58Signature = bs58.encode(buffer);

  console.log(base58Signature);

  return base58Signature;
};
