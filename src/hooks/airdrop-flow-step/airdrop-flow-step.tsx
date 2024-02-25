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
          router.push("/airdrop/create-collection");
          setCurrentStep(airdropFlowSteps.CreateCollection);
          break;
        case airdropFlowSteps.CreateCollection:
          router.push("/airdrop/create-cnfts");
          setCurrentStep(airdropFlowSteps.CreateNfts);
          break;
        case airdropFlowSteps.CreateNfts:
          router.push("/airdrop/review");
          setCurrentStep(airdropFlowSteps.Review);
          break;
      }
    },
    goToPreviousStep: () => {
      switch (currentStep) {
        case airdropFlowSteps.CreateCollection:
          router.push("/airdrop/select-recipients");
          setCurrentStep(airdropFlowSteps.SelectRecipients);
          break;
        case airdropFlowSteps.CreateNfts:
          router.push("/airdrop/create-collection");
          setCurrentStep(airdropFlowSteps.CreateCollection);
          break;
        case airdropFlowSteps.Review:
          router.push("/airdrop/create-cnfts");
          setCurrentStep(airdropFlowSteps.CreateNfts);
          break;
      }
    },
    airdropFlowSteps,
  };
}
