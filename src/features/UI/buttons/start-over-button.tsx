"use client";

import { useSaving } from "@/app/blueprint/hooks/saving";
import { FabButton } from "@/features/UI/buttons/fab-button";
import Spinner from "@/features/UI/spinner";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useLogs } from "@/hooks/logs";
import { clearLocalStorage } from "@/utils/local-storage";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";

export const StartOverButton = () => {
  const { isSaving } = useSaving();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();
  const user = useUserData();
  const router = useRouter();
  const { addLog } = useLogs();

  const handleStartOver = () => {
    clearLocalStorage();
    setCurrentStep(airdropFlowSteps.SelectCollection);
    addLog("Airdrop flow reset");
    router.push("/connect-wallet");
  };

  const handleConfirmStartOver = () => {
    const text =
      "Are you sure you want to start over? Your progress will be lost.";
    if (confirm(text)) {
      handleStartOver();
    }
  };
  if (!user) return <></>;

  if (isSaving)
    return (
      <div className="text-cyan-400 font-bold absolute top-6 left-6 z-50">
        <Spinner height={32} width={32} />
      </div>
    );

  return (
    <>
      <div className="absolute top-4 left-4" onClick={handleConfirmStartOver}>
        <FabButton>reset</FabButton>
      </div>
    </>
  );
};
