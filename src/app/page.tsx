"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { WelcomeStep } from "@/features/airdrop/flow-steps/welcome-step";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const wallet = useWallet();
  const router = useRouter();
  const user = useUserData();
  const { currentStep, setCurrentStep, airdropFlowSteps } =
    useAirdropFlowStep();

  const handleGoToNextStep = async () => {
    switch (currentStep.name) {
      case AirdropFlowStepName.Welcome:
        setCurrentStep(airdropFlowSteps.LoginSignup);
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/login-signup");
        break;
      case AirdropFlowStepName.LoginSignup:
        if (user) {
          setCurrentStep(airdropFlowSteps.ConnectWallet);
        } else {
          router.push("/login-signup");
        }
        break;
      case AirdropFlowStepName.ConnectWallet:
        router.push("/");
        break;
    }
  };

  const handleFullScreenClick = () => {
    if (currentStep === airdropFlowSteps.Welcome) {
      handleGoToNextStep();
    }
  };

  useEffect(() => {
    setCurrentStep(airdropFlowSteps.Welcome);
  }, [
    wallet?.publicKey,
    setCurrentStep,
    airdropFlowSteps.SelectRecipients,
    router,
    airdropFlowSteps.Welcome,
  ]);

  return (
    <ContentWrapper className="cursor-pointer">
      <ContentWrapperYAxisCenteredContent
        onClick={() => handleFullScreenClick()}
      >
        <WelcomeStep />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
