import { fadeIn } from "@/animations";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { use, useEffect, useRef, useState } from "react";

export const FlowProgressIndicator = () => {
  const { currentStep, goToNextStep, goToPreviousStep, airdropFlowSteps } =
    useAirdropFlowStep();

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
  }, [currentStep, airdropFlowSteps, progressIndicatorRef, showIndicator]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      ref={progressIndicatorRef}
      id="progress-indicator"
      className="fixed w-full h-20 min-w-screen max-w-screen bottom-0 bg-gray-100 opacity-0"
    >
      <div className="absolute">{currentStep}</div>
      <div className="flex items-center justify-between h-full mx-auto max-w-6xl">
        <SecondaryButton className="flex space-x-1" onClick={goToPreviousStep}>
          <ChevronLeftIcon className="w-6 h-6" />
          <div>back</div>
        </SecondaryButton>
        <div
          className={classNames(
            "border-2 w-1/6 h-4 rounded-lg",
            currentStep === airdropFlowSteps.SelectRecipients
              ? "border-cyan-400 bg-gray-400"
              : "border-cyan-400 bg-cyan-400"
          )}
        ></div>
        <div className="bg-gray-400 w-1/6 h-4 rounded-lg"></div>
        <div className="bg-gray-400 w-1/6 h-4 rounded-lg"></div>
        <div className="bg-gray-400 w-1/6 h-4 rounded-lg"></div>
        <PrimaryButton className="flex space-x-1" onClick={goToNextStep}>
          <div>next</div>
          <ChevronLeftIcon className="w-6 h-6 transform rotate-180" />
        </PrimaryButton>
      </div>
    </div>
  );
};
