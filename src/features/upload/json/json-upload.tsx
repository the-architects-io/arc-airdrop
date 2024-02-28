import {
  BaseBlueprintResponse,
  BlueprintApiActions,
  UploadJsonFileToShadowDriveResponse,
} from "@/types";
import { BASE_URL } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import { JsonUploadField } from "@/features/upload/json/json-upload-field";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Uploady, { UploadyContextType } from "@rpldy/uploady";
import { useState } from "react";

export const JsonUpload = ({
  driveAddress,
  fileName,
  children,
  uploadyInstance,
  isFileValid,
  shouldShowComplete,
  setUploadyInstance,
  setJsonUploadResponse,
  setJsonBeingUploaded,
  setJsonFileBeingUploaded,
}: {
  driveAddress: string;
  fileName?: string;
  children?: string | JSX.Element | JSX.Element[];
  uploadyInstance: UploadyContextType | null;
  isFileValid: boolean | null;
  shouldShowComplete?: boolean;
  setUploadyInstance: (instance: UploadyContextType) => void;
  setJsonUploadResponse: (response: any) => void;
  setJsonBeingUploaded: (json: any) => void;
  setJsonFileBeingUploaded: (file: File) => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  return (
    <>
      <Uploady
        accept=".json"
        destination={{
          url: `${BASE_URL}/api/blueprint`,
          params: {
            action: BlueprintApiActions.UPLOAD_JSON,
            driveAddress,
            fileName,
            overwrite: true,
          },
        }}
        isSuccessfulCall={({ response }: { response: string }) => {
          const parsedResponse: UploadJsonFileToShadowDriveResponse &
            BaseBlueprintResponse = JSON.parse(response);
          setJsonUploadResponse(parsedResponse);
          if (parsedResponse.success) {
            setIsSuccessful(true);
            return true;
          }
          setIsSuccessful(false);
          return false;
        }}
        autoUpload={false}
      >
        <JsonUploadField
          isFileValid={isFileValid}
          uploadyInstance={uploadyInstance}
          setUploadyInstance={setUploadyInstance}
          setProgress={setProgress}
          setIsInProgress={setIsInProgress}
          driveAddress={driveAddress}
          setJsonBeingUploaded={setJsonBeingUploaded}
          setJsonFileBeingUploaded={setJsonFileBeingUploaded}
        >
          <>
            {isInProgress === true && (
              <div className="text-gray-100 flex justify-center items-center gap-x-2 bg-gray-400 h-48 w-48 rounded-md">
                <Spinner />
              </div>
            )}
            {(isSuccessful === true || shouldShowComplete) && (
              <div className="text-gray-100 flex flex-col justify-center items-center gap-y-4 uppercase bg-gray-400 h-48 w-48 rounded-md border-8 border-cyan-400">
                <CheckBadgeIcon className="w-20 h-20" />
              </div>
            )}
            {(isSuccessful === null || isSuccessful === true) &&
              !isInProgress &&
              !shouldShowComplete && (
                <div className="underline">
                  {!!children ? children : "Add JSONs"}
                </div>
              )}
          </>
        </JsonUploadField>
      </Uploady>
    </>
  );
};
