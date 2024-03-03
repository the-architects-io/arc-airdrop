import { useEffect } from "react";
import { fadeIn, fadeOut } from "@/animations";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";

export const WelcomeStep = () => {
  const { currentStep, setCurrentStep, airdropFlowSteps } =
    useAirdropFlowStep();

  useEffect(() => {
    fadeIn("#welcome");
    fadeIn("#click-anywhere", {
      delay: 1,
    });
  }, []);

  useEffect(() => {
    if (currentStep !== airdropFlowSteps.Welcome) {
      fadeOut("#welcome");
      fadeOut("#click-anywhere");
    }
  }, [airdropFlowSteps.Welcome, currentStep]);

  return (
    <>
      <div
        id="welcome"
        className="text-6xl font-heavy tracking-widest mb-4 opacity-0 pointer-events-none"
      >
        welcome
      </div>
      <div id="click-anywhere" className="tracking-[0.2em] opacity-0">
        click anywhere to begin
      </div>
    </>
  );
};
