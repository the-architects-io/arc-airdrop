import { CnftCard } from "@/features/UI/cards/cnft-card";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { useRouter } from "next/navigation";

export const CreateCnftsStep = () => {
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
