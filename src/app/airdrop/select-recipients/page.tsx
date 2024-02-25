"use client";
import { fadeIn } from "@/animations";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { SelectRecipientsStep } from "@/features/airdrop/flow-steps/select-recipients-step";
import { LoadingPanel } from "@/features/loading-panel";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SelectRecipientsPage() {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const { currentStep, setCurrentStep, airdropFlowSteps } =
    useAirdropFlowStep();

  const [isLoading, setIsLoading] = useState(true);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login-signup");
      return;
    }
    if (!wallet?.publicKey) {
      router.push("/connect-wallet");
      return;
    }
    setCurrentStep(airdropFlowSteps.SelectRecipients);
    setIsLoading(false);
    const panelEl = document.querySelector(".panel-fade-in-out");
    while (!panelEl) {
      return;
    }
    setTimeout(() => {
      fadeIn(".panel-fade-in-out");
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, user, contentWrapperRef]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper
      className="panel-fade-in-out opacity-0"
      ref={contentWrapperRef}
    >
      <ContentWrapperYAxisCenteredContent>
        <SelectRecipientsStep />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
