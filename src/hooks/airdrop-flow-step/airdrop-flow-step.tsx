import { fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import { useRouter } from "next/navigation";
import { useContext, createContext, useState, ReactNode, useRef } from "react";

type AirdropFlowStep = {
  name: string;
  isValid: boolean;
};

type AirdropFlowSteps = {
  [key: string]: AirdropFlowStep;
};

export enum AirdropFlowStepName {
  Welcome = "Welcome",
  LoginSignup = "LoginSignup",
  ConnectWallet = "ConnectWallet",
  SelectRecipients = "SelectRecipients",
  CreateCollection = "CreateCollection",
  CreateNfts = "CreateNfts",
  Review = "Review",
  ExecuteAirdrop = "ExecuteAirdrop",
}

export type AirdropFlowStepContext = {
  currentStep: AirdropFlowStep;
  setCurrentStep: (step: AirdropFlowStep) => void;
  setStepIsValid: (stepName: AirdropFlowStepName, isValid: boolean) => void;
  airdropFlowSteps: AirdropFlowSteps;
};

export const AirdropFlowStepContext = createContext<AirdropFlowStepContext>(
  {} as AirdropFlowStepContext
);

const { Provider } = AirdropFlowStepContext;
export const AirdropFlowStepProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const airdropFlowSteps = useRef<AirdropFlowSteps>({
    Welcome: { name: "welcome", isValid: true },
    LoginSignup: { name: "login-signup", isValid: true },
    ConnectWallet: { name: "connect-wallet", isValid: true },
    SelectRecipients: { name: "select-recipients", isValid: false },
    CreateCollection: { name: "create-collection", isValid: false },
    CreateNfts: { name: "create-cnfts", isValid: false },
    Review: { name: "review", isValid: false },
    ExecuteAirdrop: { name: "execute-airdrop", isValid: false },
  });

  const [currentStep, setCurrentStep] = useState<AirdropFlowStep>(
    airdropFlowSteps.current.Welcome
  );

  const [_, forceUpdate] = useState({}); // Used to force re-render

  const setStepIsValid = (stepName: string, isValid: boolean) => {
    if (airdropFlowSteps.current[stepName]) {
      airdropFlowSteps.current[stepName].isValid = isValid;
      forceUpdate({}); // Trigger a re-render
    }
  };

  return (
    <Provider
      value={{
        airdropFlowSteps: airdropFlowSteps.current,
        currentStep,
        setCurrentStep,
        setStepIsValid,
      }}
    >
      {children}
    </Provider>
  );
};

export function useAirdropFlowStep() {
  const { currentStep, setCurrentStep, airdropFlowSteps, setStepIsValid } =
    useContext(AirdropFlowStepContext);
  const [_, forceUpdate] = useState({});

  const router = useRouter();

  return {
    currentStep,
    setCurrentStep,
    goToNextStep: () => {
      const currentStepIsValid = airdropFlowSteps[currentStep.name].isValid;
      if (!currentStepIsValid) return;

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
    setStepIsValid,
    airdropFlowSteps,
  };
}
