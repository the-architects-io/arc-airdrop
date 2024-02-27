import axios from "axios";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { LoadingPanel } from "@/features/loading-panel";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { GET_SNAPSHOT_OPTIONS } from "@/graphql/queries/get-snapshot-options";
import { useQuery } from "@apollo/client";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";
import { use, useCallback, useEffect, useState } from "react";
import { isPublicKey } from "@metaplex-foundation/umi";
import { BlueprintApiActions, UploadJsonResponse } from "@/types";
import showToast from "@/features/toasts/show-toast";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";

type SnapshotOption = {
  updatedAt: string;
  name: string;
  imageUrl: string;
  firstVerifiedCreatorAddress: string;
  id: string;
  createdAt: string;
  collectionAddress: string;
};

export const SelectRecipientsStep = ({ airdropId }: { airdropId: string }) => {
  const [recipientCount, setRecipientCount] = useState(15000);
  const [selectedSnapshotOptions, setSelectedSnapshotOptions] = useState<
    string[] | null
  >(null);
  const [jsonUploadyInstance, setJsonUploadyInstance] = useState<any>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any>(null);
  const [jsonFileBeingUploaded, setJsonFileBeingUploaded] = useState<any>(null);
  const [isValidHashlist, setIsValidHashlist] = useState<boolean | null>(null);
  const [uploadResponse, setUploadResponse] =
    useState<UploadJsonResponse | null>(null);

  const {
    loading,
    data: snapshotOptionsData,
  }: {
    loading: boolean;
    data: { snapshotOptions: SnapshotOption[] } | undefined;
  } = useQuery(GET_SNAPSHOT_OPTIONS);

  const handleSelectSnapshotOption = (snapshotOptionId: string) => {
    if (selectedSnapshotOptions?.includes(snapshotOptionId)) {
      setSelectedSnapshotOptions(
        selectedSnapshotOptions.filter((id) => id !== snapshotOptionId)
      );
    } else {
      setSelectedSnapshotOptions(
        selectedSnapshotOptions
          ? [...selectedSnapshotOptions, snapshotOptionId]
          : [snapshotOptionId]
      );
    }
  };

  const handleJsonUploadComplete = useCallback(
    async ({ url, success }: UploadJsonResponse) => {
      if (!success) {
        showToast({
          primaryMessage: "JSON Upload Failed",
        });
        return;
      }

      showToast({
        primaryMessage: "JSON Uploaded",
      });

      const { data } = await axios.get(url);

      setUploadResponse(data);
    },
    []
  );

  const handleClearFile = useCallback(() => {
    setJsonBeingUploaded(null);
    jsonUploadyInstance?.clearPending();
  }, [jsonUploadyInstance]);

  const validateHashlist = useCallback(
    (json: any) => {
      if (!json) return false;
      if (!Array.isArray(json)) {
        showToast({
          primaryMessage: "Json is not an array",
        });
        handleClearFile();
        return false;
      }
      if (json.length === 0) {
        console.error("json is empty");
        showToast({
          primaryMessage: "Json is empty",
        });
        return false;
      }

      if (json.some((address: any) => !isPublicKey(address))) {
        console.error("json contains invalid addresses");
        showToast({
          primaryMessage: "Json contains invalid addresses",
        });
        return false;
      }

      return true;
    },
    [handleClearFile]
  );

  const save = useCallback(async () => {
    try {
      await jsonUploadyInstance.processPending({
        params: {
          driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
          action: BlueprintApiActions.UPLOAD_JSON,
          fileName: `${airdropId}-${Date.now()}-airdrop-custom-recipient-list.json`,
          overwrite: true,
        },
      });
    } catch (error) {
      console.error("error uploading json", error);
      showToast({
        primaryMessage: "Error uploading JSON",
      });
    }
  }, [airdropId, jsonUploadyInstance]);

  useEffect(() => {
    if (jsonBeingUploaded) {
      setIsValidHashlist(validateHashlist(jsonBeingUploaded));
    }
  }, [jsonBeingUploaded, setJsonBeingUploaded, validateHashlist]);

  useEffect(() => {
    if (jsonBeingUploaded && isValidHashlist) {
      save();
    }
  }, [jsonBeingUploaded, isValidHashlist, save]);

  if (!snapshotOptionsData) {
    return <LoadingPanel />;
  }

  return (
    <>
      <StepTitle>choose your recipients</StepTitle>
      <StepSubtitle>
        <div className="flex items-center">
          <span className="text-red-400 text-3xl mr-3">{recipientCount} </span>
          <div>recipients selected</div>
        </div>
      </StepSubtitle>
      <div className="flex flex-wrap gap-y-4 mb-28">
        <div className="w-1/2 sm:w-1/3 lg:w-1/4 flex flex-col items-center justify-center mb-4">
          <JsonUpload
            isFileValid={isValidHashlist}
            uploadyInstance={jsonUploadyInstance}
            setUploadyInstance={setJsonUploadyInstance}
            setJsonFileBeingUploaded={setJsonFileBeingUploaded}
            setJsonBeingUploaded={setJsonBeingUploaded}
            setJsonUploadResponse={handleJsonUploadComplete}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            fileName={`${airdropId}-${Date.now()}-airdrop-custom-recipient-list.json`}
          >
            <div className="w-48 h-48 bg-gray-400 text-gray-100 flex flex-col justify-center items-center text-center text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer hover:scale-[1.05] rounded-md shadow-deep hover:shadow-deep-float">
              <div className="mb-2">upload your own hashlist</div>
              <PlusCircleIcon className="w-12 h-12" />
            </div>
          </JsonUpload>
        </div>
        {snapshotOptionsData.snapshotOptions.map((option, index) => (
          <div
            key={index}
            className="w-1/2 sm:w-1/3 lg:w-1/4 flex flex-col items-center justify-center mb-4"
          >
            <button
              className={classNames([
                "w-48 h-48 relative cursor-pointer hover:scale-[1.05] transition-all duration-300 ease-in-out shadow-deep hover:shadow-deep-float rounded-lg border-8",
                selectedSnapshotOptions?.includes(option.id)
                  ? "border-cyan-400 scale-[1.05]"
                  : "border-hidden",
              ])}
              onClick={() => handleSelectSnapshotOption(option.id)}
            >
              <Image
                className="rounded"
                src={option.imageUrl}
                alt={option.name}
                layout="fill"
                objectFit="cover"
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
