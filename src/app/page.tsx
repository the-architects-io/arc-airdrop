"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { WelcomeStep } from "@/features/airdrop/flow-steps/welcome-step";
import {
  airdropFlowSteps,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const wallet = useWallet();
  const router = useRouter();
  const user = useUserData();
  const { currentStep, setCurrentStep } = useAirdropFlowStep();

  const handleGoToNextStep = async () => {
    switch (currentStep) {
      case airdropFlowSteps.Welcome:
        setCurrentStep(airdropFlowSteps.LoginSignup);
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/login-signup");
        break;
      case airdropFlowSteps.LoginSignup:
        if (user) {
          setCurrentStep(airdropFlowSteps.ConnectWallet);
        } else {
          router.push("/login-signup");
        }
        break;
      case airdropFlowSteps.ConnectWallet:
        router.push("/");
        break;
    }
  };

  const handleFullScreenClick = () => {
    if (currentStep === airdropFlowSteps.Welcome) {
      handleGoToNextStep();
    }
  };

  return (
    <ContentWrapper className="cursor-pointer">
      <ContentWrapperYAxisCenteredContent
        onClick={() => handleFullScreenClick()}
      >
        <WelcomeStep currentStep={currentStep} />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
