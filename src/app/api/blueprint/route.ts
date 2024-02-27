import {
  BlueprintApiActions,
  MappedErrorResponse,
} from "@/app/blueprint/types";
import { BASE_URL, ENV } from "@/constants/constants";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

const {
  ADD_AIRDROP_RECIPIENTS,
  CREATE_COLLECTION,
  CREATE_AIRDROP,
  CREATE_DRIVE,
  CREATE_DISENSER,
  CREATE_TOKENS,
  CREATE_TREE,
  CREATE_JOB,
  CREATE_UPLOAD_JOB,
  DELETE_DRIVE,
  DISPENSE_TOKENS,
  GET_DRIVE,
  GET_DRIVES,
  INCREASE_STORAGE,
  MINT_CNFT,
  MINT_NFT,
  REDUCE_STORAGE,
  REPORT_ERROR,
  REPORT_JOB,
  UPDATE_AIRDROP,
  UPDATE_JOB,
  UPDATE_COLLECTION,
  UPDATE_UPLOAD_JOB,
  UPLOAD_JSON,
  UPDATE_TOKENS,
  UPLOAD_FILE,
  UPLOAD_FILES,
} = BlueprintApiActions;

const BlueprintApiActionUrls = {
  [ADD_AIRDROP_RECIPIENTS]: `${BASE_URL}/api/add-airdrop-recipients`,
  [CREATE_AIRDROP]: `${BASE_URL}/api/add-airdrop`,
  [CREATE_COLLECTION]: `${BASE_URL}/api/add-collection`,
  [CREATE_DRIVE]: `${BASE_URL}/api/create-drive`,
  [CREATE_DISENSER]: `${BASE_URL}/api/add-dispenser`,
  [CREATE_TREE]: `${BASE_URL}/api/create-tree`,
  [CREATE_JOB]: `${BASE_URL}/api/create-job`,
  [CREATE_TOKENS]: `${BASE_URL}/api/add-tokens`,
  [CREATE_UPLOAD_JOB]: `${BASE_URL}/api/add-upload-job`,
  [DELETE_DRIVE]: `${BASE_URL}/api/delete-drive`,
  [DISPENSE_TOKENS]: `${BASE_URL}/api/dispense-tokens`,
  [GET_DRIVE]: `${BASE_URL}/api/get-drive`,
  [GET_DRIVES]: `${BASE_URL}/api/get-drives`,
  [INCREASE_STORAGE]: `${BASE_URL}/api/increase-storage`,
  [MINT_CNFT]: `${BASE_URL}/api/mint-cnft`,
  [MINT_NFT]: `${BASE_URL}/api/mint-nft`,
  [REDUCE_STORAGE]: `${BASE_URL}/api/reduce-storage`,
  [REPORT_ERROR]: `${BASE_URL}/api/report-error`,
  [REPORT_JOB]: `${BASE_URL}/api/report-job`,
  [UPDATE_JOB]: `${BASE_URL}/api/update-job`,
  [UPDATE_AIRDROP]: `${BASE_URL}/api/update-airdrop`,
  [UPDATE_COLLECTION]: `${BASE_URL}/api/update-collection`,
  [UPDATE_TOKENS]: `${BASE_URL}/api/update-tokens`,
  [UPDATE_UPLOAD_JOB]: `${BASE_URL}/api/update-upload-job`,
  [UPLOAD_JSON]: `${BASE_URL}/api/upload-json-file-to-shadow-drive`,
  [UPLOAD_FILE]: `${BASE_URL}/api/upload-file-to-shadow-drive`,
  [UPLOAD_FILES]: `${BASE_URL}/api/upload-files-to-shadow-drive`,
};

const mapErrorToResponse = (error: any): MappedErrorResponse => {
  const status =
    error?.response?.status || error?.response?.data?.status || 500;
  // console.log({
  //   // error,
  //   error: error.response?.data,
  //   statuses: {
  //     "error?.response?.status": error?.response?.status,
  //     "error?.response?.data?.status": error?.response?.data?.status,
  //     status: status,
  //   },
  // });
  console.log({
    cause: JSON.stringify(error?.cause),
    // fullError: error,
  });
  const statusText =
    error?.response?.data?.statusText || "Internal Server Error";
  const message = error?.response?.statusText || "Internal Server Error";
  const errorMessage = error?.response?.data?.error;

  return {
    status: status || 500,
    error: "",
    // error: JSON.stringify(error, null, 2),
    // error: { message, errorMessage, status, statusText },
  };
};

async function makeBlueprintApiRequest(
  action: BlueprintApiActions,
  data: any,
  isFormData: boolean = false
) {
  const apiKey = process.env.BLUEPRINT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Blueprint API key not configured", status: 500 },
      { status: 500 }
    );
  }

  const url = BlueprintApiActionUrls[action];

  console.log(`makeBlueprintApiRequest ${action}`, {
    action,
    data,
    url,
    apiKey,
    isFormData,
  });

  try {
    let headers = {};
    if (isFormData) {
      data.append("apiKey", apiKey);
      // No need to explicitly set 'Content-Type' as axios/browser will handle it
    } else {
      data.apiKey = apiKey;
      headers = { "Content-Type": "application/json" };
    }

    const response = await axios.post(url, data, { headers });

    // Additional check for file upload related errors
    if (isFormData && response.data?.errors?.length) {
      // Handle file-specific errors here
      return NextResponse.json({ ...response.data, status: 500 });
    }

    return NextResponse.json(
      {
        ...response.data,
        status: response.status,
        action: action,
        success: response.status === 200,
      },
      {
        status: response.status,
      }
    );
  } catch (rawError: any) {
    console.error(rawError);
    const { error, status } = mapErrorToResponse(rawError);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.API_ACCESS_HOST_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  // const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  // const host = req.headers.get("x-forwarded-host") || "";
  // const isValidHost = hostWhitelist.indexOf(host) > -1;

  // if (ENV !== "local" && !isValidHost) {
  //   return NextResponse.json(
  //     {
  //       error: `API access not allowed for host: ${host}`,
  //       status: 500,
  //     },
  //     { status: 500 }
  //   );
  // }

  // Extract action and parameters from request
  let action, params;
  if (req.headers.get("content-type") === "application/json") {
    const json = await req.json();
    action = json.action;
    params = json.params;
  } else {
    params = await req.formData();
    action = params.get("action");
  }

  // Determine if the request data is FormData
  const isFormData = req.headers.get("content-type") !== "application/json";

  console.log({
    action,
    params,
  });

  // Make API request based on action
  return makeBlueprintApiRequest(action, params, isFormData);
}
