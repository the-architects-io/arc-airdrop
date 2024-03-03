import { fadeIn } from "@/animations";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import {
  airdropFlowSteps,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { use, useEffect, useRef, useState } from "react";

export const FlowProgressIndicator = () => {
  const { isSaving } = useSaving();
  const { currentStep, goToNextStep, goToPreviousStep } = useAirdropFlowStep();

  const [showIndicator, setShowIndicator] = useState(false);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      currentStep === airdropFlowSteps.Welcome ||
      currentStep === airdropFlowSteps.LoginSignup ||
      currentStep === airdropFlowSteps.ConnectWallet
    ) {
      setShowIndicator(false);
      return;
    } else {
      if (!showIndicator) {
        setShowIndicator(true);
        setTimeout(() => {
          fadeIn("#progress-indicator");
        }, 400);
      }
    }
  }, [currentStep, progressIndicatorRef, showIndicator]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      ref={progressIndicatorRef}
      id="progress-indicator"
      className="fixed w-full h-20 min-w-screen max-w-screen bottom-0 bg-gray-100 opacity-0"
    >
      <div className="flex items-center justify-between h-full mx-auto max-w-6xl px-10">
        <SecondaryButton className="flex space-x-1" onClick={goToPreviousStep}>
          <ChevronLeftIcon className="w-6 h-6" />
          <div>back</div>
        </SecondaryButton>
        <div
          className={classNames(
            "border-2 w-1/6 h-4 rounded-full shadow-lg",
            currentStep === airdropFlowSteps.SelectRecipients
              ? "border-cyan-400 bg-gray-400"
              : "border-cyan-400 bg-cyan-400"
          )}
        />
        <div
          className={classNames("border-2 w-1/6 h-4 rounded-full shadow-lg", {
            "border-cyan-400 bg-gray-400":
              currentStep === airdropFlowSteps.CreateCollection,
            "border-gray-400 bg-gray-400":
              currentStep === airdropFlowSteps.SelectRecipients,
            "border-cyan-400 bg-cyan-400":
              currentStep === airdropFlowSteps.CreateNfts ||
              currentStep === airdropFlowSteps.Review,
          })}
        />
        <div
          className={classNames("border-2 w-1/6 h-4 rounded-full shadow-lg", {
            "border-cyan-400 bg-gray-400":
              currentStep === airdropFlowSteps.CreateNfts,
            "border-gray-400 bg-gray-400":
              currentStep === airdropFlowSteps.SelectRecipients ||
              currentStep === airdropFlowSteps.CreateCollection,
            "border-cyan-400 bg-cyan-400":
              currentStep === airdropFlowSteps.Review,
          })}
        />
        <div
          className={classNames("border-2 w-1/6 h-4 rounded-full shadow-lg", {
            "border-cyan-400 bg-gray-400":
              currentStep === airdropFlowSteps.Review,
            "border-gray-400 bg-gray-400":
              currentStep === airdropFlowSteps.SelectRecipients ||
              currentStep === airdropFlowSteps.CreateNfts ||
              currentStep === airdropFlowSteps.CreateCollection,
          })}
        />
        <SecondaryButton
          className="flex space-x-1"
          onClick={goToNextStep}
          disabled={isSaving}
        >
          next
          <ChevronLeftIcon className="w-6 h-6 transform rotate-180" />
        </SecondaryButton>
      </div>
    </div>
  );
};
