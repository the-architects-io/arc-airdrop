import showToast from "@/features/toasts/show-toast";
import { BlueprintApiActions } from "@/types";
import UploadButton from "@rpldy/upload-button";
import {
  Batch,
  UploadyContextType,
  useBatchAddListener,
  useBatchFinishListener,
  useRequestPreSend,
  useUploady,
} from "@rpldy/uploady";
import { useEffect, useState } from "react";

export const JsonUploadField = ({
  driveAddress,
  children,
  uploadyInstance,
  isFileValid,
  setUploadyInstance,
  setJsonBeingUploaded,
  setIsInProgress,
  setProgress,
  setJsonFileBeingUploaded,
}: {
  driveAddress: string;
  children: string | JSX.Element | JSX.Element[];
  uploadyInstance: UploadyContextType | null;
  isFileValid: boolean | null;
  setUploadyInstance: (instance: UploadyContextType) => void;
  setJsonBeingUploaded: (json: any) => void;
  setIsInProgress: (isInProgress: boolean) => void;
  setProgress: (progress: number) => void;
  setJsonFileBeingUploaded: (file: File) => void;
}) => {
  const uploady = useUploady();

  const [batch, setBatch] = useState<Batch | null>(null);

  useRequestPreSend(async ({ items, options }) => {
    if (!isFileValid) {
      showToast({
        primaryMessage: "Invalid file",
      });

      return {
        abort: true,
        cancel: true,
      };
    }

    return {
      options,
    };
  });

  useBatchAddListener((batch: Batch) => {
    setBatch(batch);
    setJsonFileBeingUploaded(batch.items[0].file as File);
    console.log("batch add", batch);
    setIsInProgress(true);
    const reader = new FileReader();
    reader.readAsText(batch.items[0].file as unknown as Blob);
    reader.onload = () => {
      const json = JSON.parse(reader.result as string);
      setJsonBeingUploaded(json);
    };
  });

  useBatchFinishListener((batch: Batch) => {
    console.log("batch finish", batch);
    setIsInProgress(false);
  });

  useEffect(() => {
    if (!uploadyInstance) {
      setUploadyInstance(uploady);
    }
    if (!batch?.completed) return;
  }, [
    batch?.completed,
    batch?.total,
    setProgress,
    setUploadyInstance,
    uploady,
    uploadyInstance,
  ]);

  return (
    <UploadButton
      autoUpload={false}
      params={{
        action: BlueprintApiActions.UPLOAD_JSON,
        driveAddress,
        overwrite: true,
      }}
    >
      {!!children ? children : "Add JSONs"}
    </UploadButton>
  );
};
