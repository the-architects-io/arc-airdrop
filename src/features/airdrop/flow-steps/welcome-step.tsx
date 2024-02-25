import { useEffect } from "react";
import { airdropFlowSteps } from "@/app/page";
import { fadeIn, fadeOut } from "@/animations";

export const WelcomeStep = ({ currentStep }: { currentStep: string }) => {
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
  }, [currentStep]);

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
