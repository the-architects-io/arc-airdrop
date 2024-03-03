"use client";
import { FlowProgressIndicator } from "@/features/flow-progress-indicator";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";

export const FlowProgressIndicatorWrapper = () => {
  const { currentStep, airdropFlowSteps } = useAirdropFlowStep();

  if (currentStep === airdropFlowSteps.ExecuteAirdrop) return null;

  return <FlowProgressIndicator />;
};
