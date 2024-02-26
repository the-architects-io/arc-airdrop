"use client";
import { fadeIn, fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { LoadingPanel } from "@/features/loading-panel";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ConnectWalletPage() {
  const wallet = useWallet();
  const router = useRouter();
  const user = useUserData();

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [didStartAnimation, setDidStartAnimation] = useState(false);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login-signup");
      return;
    }
    if (!wallet?.publicKey) {
      setIsLoading(false);
      setIsFirstLoad(false);
      setTimeout(() => {
        const contentWrapperId = contentWrapperRef?.current?.id;
        if (!contentWrapperId) return;
        fadeIn(`#${contentWrapperId}`);
      }, 200);
      return;
    }
    if (!isFirstLoad && !didStartAnimation) {
      setDidStartAnimation(true);
      fadeOut("#connect-wallet-panel");
      setTimeout(() => {
        router.push("/airdrop/select-recipients");
      }, fadeOutTimeoutDuration);
      return;
    }

    router.push("/airdrop/select-recipients");
  }, [wallet, router, user, isFirstLoad, didStartAnimation]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper
      id="connect-wallet-panel"
      className="panel-fade-in-out opacity-0"
      ref={contentWrapperRef}
    >
      <ContentWrapperYAxisCenteredContent>
        <WalletButton />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
