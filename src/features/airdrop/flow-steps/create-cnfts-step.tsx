import { CnftCard } from "@/features/UI/cards/cnft-card";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export const CreateCnftsStep = () => {
  const router = useRouter();

  return (
    <>
      <StepTitle>create compressed nfts</StepTitle>
      <StepSubtitle>0 / 15,000 cnfts created</StepSubtitle>
      <div className="flex flex-wrap gap-y-4 w-full h-full justify-center pb-28">
        <CnftCard />
      </div>
    </>
  );
};
