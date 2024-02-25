"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { WelcomeStep } from "@/features/airdrop/flow-steps/welcome-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const airdropFlowSteps = {
  Welcome: "welcome",
  LoginSignup: "login-signup",
  ConnectWallet: "connect-wallet",
};

export default function Page() {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(airdropFlowSteps.Welcome);
  const router = useRouter();
  const user = useUserData();

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isLoading]);

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
