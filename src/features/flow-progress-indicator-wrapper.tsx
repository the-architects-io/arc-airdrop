"use client";
import { FlowProgressIndicator } from "@/features/flow-progress-indicator";
import {
  airdropFlowSteps,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";

export const FlowProgressIndicatorWrapper = () => {
  const { currentStep } = useAirdropFlowStep();

  if (currentStep === airdropFlowSteps.ExecuteAirdrop) return null;

  return <FlowProgressIndicator />;
};
