import { fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export const CnftCard = () => {
  const router = useRouter();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();

  const handleAddNewCnft = () => {
    fadeOut("#create-cnfts-panel");
    setTimeout(() => {
      router.push("/airdrop/create-cnfts/builder");
      setCurrentStep(airdropFlowSteps.CreateCollection);
    }, fadeOutTimeoutDuration);
  };

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-col mb-4">
      <div className="mx-4 h-full min-h-full">
        <div className="shadow-deep rounded-md hover:rounded-md border border-gray-400 w-full flex flex-col flex-1 h-full min-h-full">
          <button
            onClick={handleAddNewCnft}
            className="w-full aspect-square flex flex-col items-center justify-center bg-gray-400 rounded-t-md text-gray-100 hover:bg-cyan-500 hover:rounded-t-md"
          >
            <PlusCircleIcon className="w-48 h-48" />
            <div className="text-3xl">add new</div>
          </button>
          <div className="flex flex-col flex-grow bg-gray-500 rounded-b-md">
            <div className="p-4 w-full space-y-2 flex-grow">
              <FormInputWithLabel
                className="text-gray-100 text-base"
                label="name"
                name="name"
                placeholder="e.g. my nft"
                value={""}
                disabled
              />
              <FormTextareaWithLabel
                className="text-gray-100 text-base"
                label="description"
                name="description"
                placeholder="e.g. my nft description"
                value={""}
                disabled
              />
              <FormInputWithLabel
                className="text-gray-100 text-base"
                label="link"
                name="link"
                placeholder="e.g. my nft"
                value={""}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
