import { fadeIn } from "@/animations";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { fadeInDuration } from "@/constants/constants";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import { animate } from "motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const FlowProgressIndicator = () => {
  const pathname = usePathname();
  const { isSaving } = useSaving();
  const [isCnftBuilder, setIsCnftBuilder] = useState(false);
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    currentStepIsValid,
    airdropFlowSteps,
  } = useAirdropFlowStep();

  const [showIndicator, setShowIndicator] = useState(false);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isInitialStep = [
      AirdropFlowStepName.Welcome,
      AirdropFlowStepName.LoginSignup,
      AirdropFlowStepName.ConnectWallet,
    ].includes(currentStep?.name);

    if (isInitialStep) {
      setShowIndicator(false);
    } else if (!showIndicator) {
      setShowIndicator(true);
      setTimeout(() => {
        const elementSelector = "#progress-indicator";
        const element = document.querySelector(elementSelector);
        if (!element) {
          return;
        }
        animate(elementSelector, { bottom: [0] }, { duration: fadeInDuration });
      }, 400);
    }
  }, [currentStep?.name, showIndicator]);

  useEffect(() => {
    setIsCnftBuilder(pathname === "/airdrop/create-cnfts/builder");
  }, [pathname]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      ref={progressIndicatorRef}
      id="progress-indicator"
      className={classNames([
        "fixed w-full h-20 min-w-screen max-w-screen -bottom-32 backdrop-blur-md backdrop-opacity-100 backdrop-contrast-150 transition-all",
        isCnftBuilder ? "opacity-0" : "opacity-100",
      ])}
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
          disabled={isSaving || !currentStepIsValid}
        >
          {currentStep === airdropFlowSteps.Review ? "start airdrop" : "next"}
          <ChevronLeftIcon className="w-6 h-6 transform rotate-180" />
        </SecondaryButton>
      </div>
    </div>
  );
};
