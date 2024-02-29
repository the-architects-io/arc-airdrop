import { ShadowUploadResponse } from "@shadow-drive/sdk";

export enum Steps {
  Welcome,
  ConnectWallet,
  SelectToken,
  Confirm,
  Airdrop,
}

export type BaseBlueprintResponse = {
  status: number;
  statusText: string;
  message: string;
  success: boolean;
  error?: string;
};

export enum BlueprintApiActions {
  ADD_AIRDROP_RECIPIENTS = "ADD_AIRDROP_RECIPIENTS",
  CREATE_AIRDROP = "CREATE_AIRDROP",
  CREATE_COLLECTION = "CREATE_COLLECTION",
  CREATE_DRIVE = "CREATE_DRIVE",
  CREATE_DISENSER = "CREATE_DISENSER",
  CREATE_TOKENS = "CREATE_TOKENS",
  CREATE_TREE = "CREATE_TREE",
  CREATE_JOB = "CREATE_JOB",
  CREATE_UPLOAD_JOB = "CREATE_UPLOAD_JOB",
  DELETE_DRIVE = "DELETE_DRIVE",
  DISPENSE_TOKENS = "DISPENSE_TOKENS",
  GET_DRIVE = "GET_DRIVE",
  GET_DRIVES = "GET_DRIVES",
  INCREASE_STORAGE = "INCREASE_STORAGE",
  MINT_CNFT = "MINT_CNFT",
  MINT_NFT = "MINT_NFT",
  REDUCE_STORAGE = "REDUCE_STORAGE",
  REPORT_ERROR = "REPORT_ERROR",
  REPORT_JOB = "REPORT_JOB",
  UPDATE_AIRDROP = "UPDATE_AIRDROP",
  UPDATE_COLLECTION = "UPDATE_COLLECTION",
  UPDATE_JOB = "UPDATE_JOB",
  UPDATE_UPLOAD_JOB = "UPDATE_UPLOAD_JOB",
  UPLOAD_FILE = "UPLOAD_FILE",
  UPLOAD_FILES = "UPLOAD_FILES",
  UPLOAD_JSON = "UPLOAD_JSON",
  UPDATE_TOKENS = "UPDATE_TOKENS",
}

export type UploadJsonFileToShadowDriveResponse = {
  url: string;
  message: string;
  count?: number;
  errors?: Array<ShadowUploadResponse>;
};

export type UploadJsonResponse = BaseBlueprintResponse & {
  url: string;
};

export type TreeOptions = {
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth: number;
};
