"use client";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { LoadingPanel } from "@/features/loading-panel";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConnectWalletPage() {
  const wallet = useWallet();
  const router = useRouter();
  const user = useUserData();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login-signup");
      return;
    }
    if (!wallet?.publicKey) {
      setIsLoading(false);
      return;
    }
    router.push("/airdrop/select-recipients");
  }, [wallet, router, user]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper>
      <ContentWrapperYAxisCenteredContent>
        <WalletButton />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
