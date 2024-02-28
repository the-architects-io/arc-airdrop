import { useSaving } from "@/app/blueprint/hooks/saving";
import Spinner from "@/features/UI/spinner";
import { PreviewComponent } from "@/features/upload/single-image/preview-component";
import {
  CheckBadgeIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import UploadButton from "@rpldy/upload-button";
import UploadPreview, {
  PreviewItem,
  PreviewMethods,
} from "@rpldy/upload-preview";
import Uploady, {
  Batch,
  useBatchAddListener,
  useBatchFinishListener,
  useUploady,
} from "@rpldy/uploady";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const SingleImageUploadField = ({
  driveAddress,
  fileName,
  children,
  isInProgress,
  setIsInProgress,
}: {
  driveAddress: string;
  fileName: string;
  children: string | JSX.Element | JSX.Element[];
  isInProgress: boolean;
  setIsInProgress: (isInProgress: boolean) => void;
}) => {
  const uploady = useUploady();
  const { isSaving, setIsSaving } = useSaving();

  const imagePreviewMethodsRef = useRef<PreviewMethods>(null);
  const [selectedCollectionImagePreview, setSelectedCollectionImagePreview] =
    useState<PreviewItem | null>(null);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);
  const [isReadyToUpload, setIsReadyToUpload] = useState(false);
  const [shouldShowChildren, setShouldShowChildren] = useState(true);

  useBatchAddListener((batch: Batch) => {
    setBatch(batch);
    const extension = batch.items[0]?.file.name.split(".").pop() ?? "";
    if (!extension) {
      alert("Invalid file type");
      return;
    }

    setIsSaving(true);

    const fullFileName = `${fileName}.${extension}`;

    setShouldShowChildren(false);
    setIsInProgress(true);

    setTimeout(() => {
      uploady.processPending({
        params: {
          action: "UPLOAD_FILE",
          driveAddress,
          fileName: fullFileName,
          overwrite: true,
        },
      });
    }, 100);
  });

  useBatchFinishListener((batch: Batch) => {
    setIsInProgress(false);
    setIsSaving(false);
    setIsSuccessful(batch.completed === 100);
  });

  return (
    <div className="flex flex-col items-center w-full">
      <UploadPreview
        previewMethodsRef={imagePreviewMethodsRef}
        onPreviewsChanged={(previews) => {
          if (!previews.length) return;
          console.log({ previews });
          setSelectedCollectionImagePreview(previews[0]);
        }}
        PreviewComponent={({ url }: { url: string }) => (
          <PreviewComponent
            url={url}
            clearPreview={() => imagePreviewMethodsRef.current?.clear()}
            isInProgress={isInProgress}
            isSuccessful={isSuccessful}
          />
        )}
      />
      {!selectedCollectionImagePreview && shouldShowChildren && (
        <UploadButton autoUpload={false} className="w-full">
          {!!children ? children : "Add Image"}
        </UploadButton>
      )}
    </div>
  );
};
