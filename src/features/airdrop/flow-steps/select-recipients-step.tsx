"use client";

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
import { useCallback, useEffect, useRef, useState } from "react";
import { isPublicKey } from "@metaplex-foundation/umi";
import { BlueprintApiActions, UploadJsonResponse } from "@/types";
import showToast from "@/features/toasts/show-toast";
import {
  ARCHITECTS_API_URL,
  ASSET_SHDW_DRIVE_ADDRESS,
} from "@/constants/constants";
import { Overlay } from "@/features/UI/overlay";
import { animate } from "motion";
import { createBlueprintClient } from "@/app/blueprint/client";
import { useCluster } from "@/hooks/cluster";
import { useUserData } from "@nhost/nextjs";
import { UploadyContextType } from "@rpldy/uploady";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { Airdrop } from "@/app/blueprint/types";

type SnapshotOption = {
  updatedAt: string;
  name: string;
  imageUrl: string;
  firstVerifiedCreatorAddress: string;
  id: string;
  createdAt: string;
  collectionAddress: string;
  count?: number;
  hashlist?: string[];
};

type HolderSnapshotResponse = {
  count: number;
  uniqueCount: number;
  durationInSeconds: number;
  hashlist: string[];
  raw: any;
};

export const SelectRecipientsStep = ({ airdrop }: { airdrop: Airdrop }) => {
  const { setStepIsValid } = useAirdropFlowStep();
  const user = useUserData();
  const { setIsSaving } = useSaving();
  const { cluster } = useCluster();
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [recipientCount, setRecipientCount] = useState(0);
  const [customHashlistCount, setCustomHashlistCount] = useState(0);
  const [customHashlist, setCustomHashlist] = useState<string[]>([]);
  const [selectedSnapshotOptions, setSelectedSnapshotOptions] = useState<
    SnapshotOption[] | []
  >([]);
  const [jsonUploadyInstance, setJsonUploadyInstance] =
    useState<UploadyContextType | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any>(null);
  const [jsonFileBeingUploaded, setJsonFileBeingUploaded] = useState<any>(null);
  const [isValidHashlist, setIsValidHashlist] = useState<boolean | null>(null);
  const [isFetchingSnapshot, setIsFetchingSnapshot] = useState(false);
  const blueprint = createBlueprintClient({ cluster });
  const [didStartUploadingJson, setDidStartUploadingJson] = useState(false);
  const [didStartUploadFlow, setDidStartUploadFlow] = useState(false);

  const recipientCountRef = useRef(null);

  const {
    loading,
    data: snapshotOptionsData,
  }: {
    loading: boolean;
    data: { snapshotOptions: SnapshotOption[] } | undefined;
  } = useQuery(GET_SNAPSHOT_OPTIONS);

  const fetchHolderSnapshot = async (snapshotOption: SnapshotOption) => {
    const { data }: { data: HolderSnapshotResponse } = await axios.post(
      `${ARCHITECTS_API_URL}/snapshot/holders`,
      {
        collectionAddress: snapshotOption.collectionAddress,
      }
    );
    setIsFetchingSnapshot(false);
    return data;
  };

  const handleSelectSnapshotOption = async (snapshotOption: SnapshotOption) => {
    if (!snapshotOption?.id || !user?.id) {
      console.error("missing required data", {
        snapshotOption,
        user,
      });
      return;
    }

    const { id } = snapshotOption;
    const selectedIds = selectedSnapshotOptions?.map(({ id }) => id);
    if (selectedSnapshotOptions && selectedIds?.includes(id)) {
      setSelectedSnapshotOptions(
        selectedSnapshotOptions.filter(({ id }) => id !== snapshotOption.id)
      );
      const option = selectedSnapshotOptions.find(
        ({ id }) => id === snapshotOption.id
      );
      if (!option?.count) return;
      setRecipientCount(recipientCount - option.count);
    } else {
      setIsSaving(true);
      setIsFetchingSnapshot(true);

      setSelectedSnapshotOptions(
        selectedSnapshotOptions
          ? [...selectedSnapshotOptions, snapshotOption]
          : [snapshotOption]
      );
      if (!snapshotOption?.collectionAddress) return;
      const { count, hashlist } = await fetchHolderSnapshot(snapshotOption);
      setRecipientCount(count + recipientCount);
      const snapshotOptionWithHashlist = {
        ...snapshotOption,
        count,
        hashlist,
      };
      setSelectedSnapshotOptions(
        selectedSnapshotOptions
          ? [...selectedSnapshotOptions, snapshotOptionWithHashlist]
          : [snapshotOptionWithHashlist]
      );
      const { success: addRecipientsSuccess, addedReipientsCount } =
        await blueprint.airdrops.addAirdropRecipients({
          airdropId: airdrop.id,
          recipients: JSON.stringify(hashlist),
        });
      setIsSaving(false);
    }
  };

  const handleJsonUploadComplete = useCallback(
    async ({ url, success }: UploadJsonResponse) => {
      if (!airdrop?.id) return;
      if (!success) {
        showToast({
          primaryMessage: "JSON Upload Failed",
        });
        return;
      }

      const { data } = await axios.get(url);
      if (!data.length) {
        showToast({
          primaryMessage: "There was a problem",
          secondaryMessage: "No JSON returned from the server",
        });
        setDidStartUploadFlow(false);
        return;
      }

      setDidStartUploadFlow(false);
      setIsSaving(false);

      const recipients = await data;
      console.log({
        airdropId: airdrop.id,
        recipients,
      });

      const { success: addRecipientsSuccess, addedReipientsCount } =
        await blueprint.airdrops.addAirdropRecipients({
          airdropId: airdrop.id,
          recipients: JSON.stringify(recipients),
        });

      setRecipientCount(data.length + recipientCount);
      setCustomHashlist(data);
      setCustomHashlistCount(data.length);
    },
    [airdrop?.id, setIsSaving, blueprint.airdrops, recipientCount]
  );

  useEffect(() => {
    if (recipientCountRef?.current) {
      const { innerHTML } = recipientCountRef?.current;
      if (!innerHTML) return;
      animate(
        (progress) => {
          // @ts-ignore
          recipientCountRef.current.innerHTML = Math.round(
            progress * recipientCount
          );
        },
        { duration: 1, easing: "ease-out" }
      );
    }
  }, [recipientCount]);

  const handleClearFile = useCallback(() => {
    setJsonBeingUploaded(null);
    jsonUploadyInstance?.clearPending();
  }, [jsonUploadyInstance]);

  useEffect(() => {
    setStepIsValid(AirdropFlowStepName.SelectRecipients, recipientCount > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientCount]);

  const validateHashlist = useCallback(
    (json: any) => {
      setAttemptNumber((prev) => prev + 1);
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
        const invalidAddresses = json.filter(
          (address: any) => !isPublicKey(address)
        );

        console.error(
          "@bus: json contains invalid addresses",
          invalidAddresses
        );
        showToast({
          primaryMessage: "Json contains invalid addresses",
        });
        return false;
      }

      return true;
    },
    [handleClearFile]
  );

  const uploadJsonFile = useCallback(async () => {
    if (!user?.id || !jsonUploadyInstance) return;
    setDidStartUploadFlow(true);
    setIsSaving(true);

    if (airdrop?.id && jsonFileBeingUploaded && !didStartUploadingJson) {
      setDidStartUploadingJson(true);
      try {
        await jsonUploadyInstance.processPending({
          params: {
            driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
            action: BlueprintApiActions.UPLOAD_JSON,
            fileName: `${airdrop.id}-v${attemptNumber}-airdrop-custom-recipient-list.json`,
            overwrite: true,
          },
        });
      } catch (error) {
        console.error("error uploading json", error);
        showToast({
          primaryMessage: "Error uploading JSON",
        });
      } finally {
        handleClearFile();
        setTimeout(() => {
          setDidStartUploadingJson(false);
        }, 1000);
      }
    }
  }, [
    user?.id,
    jsonUploadyInstance,
    setIsSaving,
    airdrop?.id,
    jsonFileBeingUploaded,
    didStartUploadingJson,
    attemptNumber,
    handleClearFile,
  ]);

  useEffect(() => {
    if (jsonBeingUploaded) {
      setIsValidHashlist(validateHashlist(jsonBeingUploaded));
    }
  }, [jsonBeingUploaded, setJsonBeingUploaded, validateHashlist]);

  useEffect(() => {
    if (jsonBeingUploaded && isValidHashlist) {
      uploadJsonFile();
    }
  }, [jsonBeingUploaded, isValidHashlist, uploadJsonFile]);

  useEffect(() => {
    if (!window) return;

    const localCustomLocalHashlistCount = localStorage.getItem(
      "customHashlistCount"
    );
    const localSelectedSnapshotOptions = localStorage.getItem(
      "selectedSnapshotOptions"
    );
    const localRecipientCount = localStorage.getItem("recipientCount");

    if (
      localSelectedSnapshotOptions &&
      Object.keys(JSON.parse(localSelectedSnapshotOptions)).length
    ) {
      setSelectedSnapshotOptions(
        JSON.parse(localSelectedSnapshotOptions) || []
      );
    }
    if (localRecipientCount) {
      setRecipientCount(Number(localRecipientCount));
    }
    if (
      localCustomLocalHashlistCount &&
      Number(localCustomLocalHashlistCount) > 0
    ) {
      setCustomHashlistCount(Number(localCustomLocalHashlistCount));
    }
  }, []);

  useEffect(() => {
    if (!window) return;

    if (airdrop?.id) {
      if (recipientCount > 0) {
        localStorage.setItem("recipientCount", String(recipientCount));
      }
      localStorage.setItem("customHashlistCount", String(customHashlistCount));
      localStorage.setItem(
        "selectedSnapshotOptions",
        JSON.stringify(selectedSnapshotOptions)
      );
    }
  }, [
    selectedSnapshotOptions,
    recipientCount,
    customHashlist,
    customHashlistCount,
    airdrop?.id,
  ]);

  if (!snapshotOptionsData) {
    return <LoadingPanel />;
  }

  return (
    <>
      {(isFetchingSnapshot || didStartUploadFlow) && (
        <Overlay
          showLoader
          message={
            isFetchingSnapshot ? "getting snapshot" : "uploading hashlist"
          }
        />
      )}
      <StepTitle>choose your recipients</StepTitle>
      <StepSubtitle>
        <div className="flex items-center">
          <span className="text-red-400 text-3xl mr-3" ref={recipientCountRef}>
            {recipientCount}{" "}
          </span>
          <div>recipients selected</div>
        </div>
      </StepSubtitle>
      <div className="flex flex-wrap gap-y-4 mb-28">
        <div
          className={classNames([
            "w-1/2 sm:w-1/3 lg:w-1/4 flex flex-col items-center justify-center mb-4",
            {
              "pointer-events-none": customHashlistCount > 0,
            },
          ])}
        >
          <JsonUpload
            shouldShowComplete={customHashlistCount > 0}
            isFileValid={isValidHashlist}
            uploadyInstance={jsonUploadyInstance}
            setUploadyInstance={setJsonUploadyInstance}
            setJsonFileBeingUploaded={setJsonFileBeingUploaded}
            setJsonBeingUploaded={setJsonBeingUploaded}
            setJsonUploadResponse={handleJsonUploadComplete}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
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
                selectedSnapshotOptions?.find(({ id }) => id === option.id)
                  ? "border-cyan-400 scale-[1.05]"
                  : "border-hidden",
              ])}
              onClick={() => handleSelectSnapshotOption(option)}
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
