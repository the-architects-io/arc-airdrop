"use client";
import { fadeIn } from "@/animations";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { LoadingPanel } from "@/features/loading-panel";
import {
  airdropFlowSteps,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreateCnftsStep } from "@/features/airdrop/flow-steps/create-cnfts-step";

export default function CreateCnftsPage() {
  const user = useUserData();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [walletInitialized, setWalletInitialized] = useState(false);
  const { setCurrentStep } = useAirdropFlowStep();

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

    setCurrentStep(airdropFlowSteps.CreateNfts);
    setIsLoading(false);
  }, [user, publicKey, walletInitialized, router, setCurrentStep]);

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
      id="create-cnfts-panel"
    >
      <ContentWrapperYAxisCenteredContent>
        <CreateCnftsStep />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
