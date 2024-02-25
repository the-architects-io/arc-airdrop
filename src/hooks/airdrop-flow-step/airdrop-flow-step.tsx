import { useContext, createContext, useState, ReactNode } from "react";

export const airdropFlowSteps = {
  Welcome: "welcome",
  LoginSignup: "login-signup",
  ConnectWallet: "connect-wallet",
  SelectRecipients: "select-recipients",
  CreateCollection: "create-collection",
  CreateNfts: "create-nfts",
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

  return {
    currentStep,
    setCurrentStep,
    goToNextStep: () => {
      switch (currentStep) {
        case airdropFlowSteps.SelectRecipients:
          setCurrentStep(airdropFlowSteps.CreateCollection);
          break;
        case airdropFlowSteps.CreateCollection:
          setCurrentStep(airdropFlowSteps.CreateNfts);
          break;
        case airdropFlowSteps.CreateNfts:
          setCurrentStep(airdropFlowSteps.Review);
          break;
      }
    },
    goToPreviousStep: () => {
      switch (currentStep) {
        case airdropFlowSteps.CreateCollection:
          setCurrentStep(airdropFlowSteps.SelectRecipients);
          break;
        case airdropFlowSteps.CreateNfts:
          setCurrentStep(airdropFlowSteps.CreateCollection);
          break;
        case airdropFlowSteps.Review:
          setCurrentStep(airdropFlowSteps.CreateNfts);
          break;
      }
    },
    airdropFlowSteps,
  };
}
