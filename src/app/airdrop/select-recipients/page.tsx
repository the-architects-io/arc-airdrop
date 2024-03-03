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
import { use, useEffect, useRef, useState } from "react";

export default function SelectRecipientsPage() {
  const user = useUserData();
  const { publicKey } = useWallet();
  const router = useRouter();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();

  const [walletInitialized, setWalletInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user && !localStorage.getItem("userId")) {
      router.push("/login-signup");
    } else if (!walletInitialized) {
      const timeoutId = setTimeout(() => {
        setWalletInitialized(true);
      });

      return () => clearTimeout(timeoutId);
    } else if (
      walletInitialized &&
      !publicKey &&
      !localStorage.getItem("publicKey")
    ) {
      router.push("/connect-wallet");
    }

    if (user?.id) localStorage.setItem("userId", user.id);
    if (publicKey) localStorage.setItem("publicKey", publicKey.toString());

    setCurrentStep(airdropFlowSteps.SelectRecipients);
    setIsLoading(false);
  }, [
    user,
    publicKey,
    walletInitialized,
    router,
    setCurrentStep,
    airdropFlowSteps.SelectRecipients,
  ]);

  useEffect(() => {
    setTimeout(() => {
      const contentWrapperId = contentWrapperRef?.current?.id;
      if (!contentWrapperId) return;
      fadeIn(`#${contentWrapperId}`);
    }, 200);
  }, [contentWrapperRef, isLoading]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper
      className="panel-fade-in-out opacity-0"
      ref={contentWrapperRef}
      id="select-recipients-panel"
    >
      <ContentWrapperYAxisCenteredContent>
        <SelectRecipientsStep />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
