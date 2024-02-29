"use client";
import { fadeIn } from "@/animations";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { ReviewStep } from "@/features/airdrop/flow-steps/review-step";
import { LoadingPanel } from "@/features/loading-panel";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ReviewPage() {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();

  const [isLoading, setIsLoading] = useState(true);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    const localPublicKey = localStorage.getItem("publicKey");
    if (!user?.id && !localUserId) {
      router.push("/login-signup");
      return;
    }
    if (!wallet?.publicKey && !localPublicKey) {
      router.push("/connect-wallet");
      return;
    }

    localStorage.setItem("userId", user?.id as string);
    localStorage.setItem("publicKey", wallet?.publicKey?.toString() as string);

    setCurrentStep(airdropFlowSteps.Review);
    setIsLoading(false);
  }, [wallet, user, setCurrentStep, airdropFlowSteps, router]);

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
      id="review-panel"
    >
      <ContentWrapperYAxisCenteredContent>
        <ReviewStep />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
