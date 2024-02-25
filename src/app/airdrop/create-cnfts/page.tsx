"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useEffect } from "react";

export default function CreateNftsPage() {
  const { currentStep, setCurrentStep, airdropFlowSteps } =
    useAirdropFlowStep();

  useEffect(() => {
    setCurrentStep(airdropFlowSteps.CreateNfts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContentWrapper>
      <ContentWrapperYAxisCenteredContent>
        <h1>create cnfts</h1>
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
