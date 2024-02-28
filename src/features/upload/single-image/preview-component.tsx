import { CloseButton } from "@/features/UI/buttons/close-button";
import Spinner from "@/features/UI/spinner";
import {
  CheckBadgeIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export const PreviewComponent = ({
  url,
  isInProgress,
  isSuccessful,
  clearPreview,
}: {
  url: string;
  isInProgress: boolean;
  isSuccessful: boolean | null;
  clearPreview: () => void;
}) => {
  return (
    <div className="relative border border-gray-600 p-2 rounded-lg mb-2">
      <Image src={url} alt="Collection Image" width={500} height={500} />
      {isInProgress ? (
        <div className="flex flex-col w-full h-full justify-center items-center text-lg opacity-50 bg-gray-800 absolute top-0 right-0 left-0 bottom-0">
          <Spinner />
        </div>
      ) : (
        <>
          {isSuccessful === false && (
            <div className="absolute bottom-4 left-6 bg-black rounded-full">
              <XMarkIcon className="w-12 h-12 text-red-500" />
            </div>
          )}
          {isSuccessful === true && (
            <>
              <div className="absolute bottom-4 left-6 bg-black rounded-full">
                <CheckBadgeIcon className="w-12 h-12 text-green-500" />
              </div>
              <CloseButton onClick={clearPreview} />
            </>
          )}
        </>
      )}
    </div>
  );
};
