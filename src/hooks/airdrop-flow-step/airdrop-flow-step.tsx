import { fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import { useRouter } from "next/navigation";
import {
  useContext,
  createContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
  useCallback,
} from "react";

type AirdropFlowStep = {
  name: AirdropFlowStepName;
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
  nextStepIsValid: boolean;
  setNextStepIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  currentStepIsValid: boolean;
  setCurrentStepIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  previousStepIsValid: boolean;
  setPreviousStepIsValid: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [steps, setSteps] = useState({
    Welcome: { name: AirdropFlowStepName.Welcome, isValid: true },
    LoginSignup: { name: AirdropFlowStepName.LoginSignup, isValid: true },
    ConnectWallet: { name: AirdropFlowStepName.ConnectWallet, isValid: true },
    SelectRecipients: {
      name: AirdropFlowStepName.SelectRecipients,
      isValid: false,
    },
    CreateCollection: {
      name: AirdropFlowStepName.CreateCollection,
      isValid: false,
    },
    CreateNfts: { name: AirdropFlowStepName.CreateNfts, isValid: false },
    Review: { name: AirdropFlowStepName.Review, isValid: false },
    ExecuteAirdrop: { name: AirdropFlowStepName.ExecuteAirdrop, isValid: true },
  });

  const [currentStep, setCurrentStep] = useState<AirdropFlowStep>(
    steps.Welcome
  );
  const [nextStepIsValid, setNextStepIsValid] = useState(false);
  const [currentStepIsValid, setCurrentStepIsValid] = useState(false);
  const [previousStepIsValid, setPreviousStepIsValid] = useState(false);

  const setStepIsValid = (stepName: AirdropFlowStepName, isValid: boolean) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [stepName]: { ...prevSteps[stepName], isValid },
    }));
  };

  useEffect(() => {
    if (!currentStep) return;
    setCurrentStepIsValid(steps[currentStep.name].isValid);
    setNextStepIsValid(
      steps[
        Object.values(AirdropFlowStepName)[
          Object.values(AirdropFlowStepName).indexOf(currentStep.name) + 1
        ]
      ].isValid
    );

    if (Object.values(AirdropFlowStepName).indexOf(currentStep.name) === 0)
      return;
    setPreviousStepIsValid(
      steps[
        Object.values(AirdropFlowStepName)[
          Object.values(AirdropFlowStepName).indexOf(currentStep.name) - 1
        ]
      ].isValid
    );
  }, [currentStep, setCurrentStepIsValid, steps]);

  return (
    <Provider
      value={{
        airdropFlowSteps: steps,
        currentStep,
        setCurrentStep,
        setStepIsValid,
        nextStepIsValid,
        currentStepIsValid,
        previousStepIsValid,
        setNextStepIsValid,
        setCurrentStepIsValid,
        setPreviousStepIsValid,
      }}
    >
      {children}
    </Provider>
  );
};

export function useAirdropFlowStep() {
  const {
    currentStep,
    setCurrentStep,
    airdropFlowSteps,
    setStepIsValid,
    nextStepIsValid,
    currentStepIsValid,
    previousStepIsValid,
  } = useContext(AirdropFlowStepContext);
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
    currentStepIsValid,
    nextStepIsValid,
    previousStepIsValid,
    setStepIsValid,
    airdropFlowSteps,
  };
}
