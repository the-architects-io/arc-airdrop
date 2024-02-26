import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export const CreateCnftsStep = () => {
  const router = useRouter();

  const handleAddNewCnft = () => {
    router.push("/airdrop/create-cnfts/builder");
  };

  return (
    <>
      <StepTitle>create compressed nfts</StepTitle>
      <StepSubtitle>0 / 15,000 cnfts created</StepSubtitle>
      <div className="flex flex-wrap gap-y-4 w-full h-full justify-center pb-28">
        <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-col items-center justify-center mb-4">
          <button
            onClick={handleAddNewCnft}
            className="relative w-full bg-gray-400 rounded-t-md"
            style={{ paddingBottom: "80%" }}
          >
            <div className="absolute flex flex-col justify-center items-center text-gray-100 text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer h-full w-full hover:rounded-t-md">
              <PlusCircleIcon className="w-48 h-48" />
              <div className="text-3xl">add new</div>
            </div>
          </button>
          <div className="bg-gray-500 p-4 w-full space-y-2 rounded-b-md">
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
            <FormTextareaWithLabel
              className="text-gray-100 text-base"
              label="traits"
              name="traits"
              value={""}
              disabled
            />
          </div>
        </div>
      </div>
    </>
  );
};
