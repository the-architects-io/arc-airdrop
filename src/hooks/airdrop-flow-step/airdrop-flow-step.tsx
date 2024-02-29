import { fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, ReactNode } from "react";

export const airdropFlowSteps = {
  Welcome: "welcome",
  LoginSignup: "login-signup",
  ConnectWallet: "connect-wallet",
  SelectRecipients: "select-recipients",
  CreateCollection: "create-collection",
  CreateNfts: "create-cnfts",
  Review: "review",
};

export const AirdropFlowStepContext = createContext(
  {} as AirdropFlowStepContext
);

const { Provider } = AirdropFlowStepContext;

export const AirdropFlowStepProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState(airdropFlowSteps.Welcome);

  return (
    <Provider
      value={{
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </Provider>
  );
};

export type AirdropFlowStepContext = {
  currentStep: string;
  setCurrentStep: (step: string) => void;
};

export function useAirdropFlowStep() {
  const { currentStep, setCurrentStep } = useContext(AirdropFlowStepContext);
  const router = useRouter();

  return {
    currentStep,
    setCurrentStep,
    goToNextStep: () => {
      switch (currentStep) {
        case airdropFlowSteps.SelectRecipients:
          fadeOut("#select-recipients-panel");
          setTimeout(() => {
            router.push("/airdrop/create-collection");
            setCurrentStep(airdropFlowSteps.CreateCollection);
          }, fadeOutTimeoutDuration);
          break;
        case airdropFlowSteps.CreateCollection:
          fadeOut("#create-collection-panel");
          setTimeout(() => {
            router.push("/airdrop/create-cnfts");
            setCurrentStep(airdropFlowSteps.CreateNfts);
          }, fadeOutTimeoutDuration);
          break;
        case airdropFlowSteps.CreateNfts:
          fadeOut("#create-cnfts-panel");
          setTimeout(() => {
            router.push("/airdrop/review");
            setCurrentStep(airdropFlowSteps.Review);
          }, fadeOutTimeoutDuration);
          break;
        case airdropFlowSteps.Review:
          router.push("/airdrop/review?step=payment");
      }
    },
    goToPreviousStep: () => {
      switch (currentStep) {
        case airdropFlowSteps.CreateCollection:
          fadeOut("#create-collection-panel");
          setTimeout(() => {
            router.push("/airdrop/select-recipients");
            setCurrentStep(airdropFlowSteps.SelectRecipients);
          }, fadeOutTimeoutDuration);
          break;
        case airdropFlowSteps.CreateNfts:
          fadeOut("#create-cnfts-panel");
          fadeOut("#build-cnft-panel");
          setTimeout(() => {
            router.push("/airdrop/create-collection");
            setCurrentStep(airdropFlowSteps.CreateCollection);
          }, fadeOutTimeoutDuration);
          break;
        case airdropFlowSteps.Review:
          fadeOut("#review-panel");
          setTimeout(() => {
            router.push("/airdrop/create-cnfts");
            setCurrentStep(airdropFlowSteps.CreateNfts);
          }, fadeOutTimeoutDuration);
          break;
      }
    },
    airdropFlowSteps,
  };
}
