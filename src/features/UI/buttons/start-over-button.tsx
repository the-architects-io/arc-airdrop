"use client";

import { useSaving } from "@/app/blueprint/hooks/saving";
import Spinner from "@/features/UI/spinner";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";

export const StartOverButton = () => {
  const { isSaving } = useSaving();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();
  const user = useUserData();
  const router = useRouter();

  const clearLocalStorage = () => {
    const whiteList: string[] = ["publicKey", "userId", "walletName"];

    const allKeys = Object.keys(localStorage);

    for (const key of allKeys) {
      if (!whiteList.includes(key)) {
        localStorage.removeItem(key);
      }
    }
  };

  const handleStartOver = () => {
    clearLocalStorage();
    setCurrentStep(airdropFlowSteps.SelectRecipients);
    router.push("/airdrop/select-recipients");
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
        <button className="rounded-full text-gray-600 px-4 py-2 text-sm shadow-deep">
          {/* // <ArrowUturnLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" /> */}
          reset
        </button>
      </div>
    </>
  );
};
