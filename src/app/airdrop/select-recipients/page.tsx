"use client";
import { fadeIn } from "@/animations";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { LoadingPanel } from "@/features/loading-panel";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SelectRecipientsPage() {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [recipientCount, setRecipientCount] = useState(15000);

  useEffect(() => {
    if (!user?.id) {
      router.push("/login-signup");
      return;
    }
    if (!wallet?.publicKey) {
      router.push("/connect-wallet");
      return;
    }
    fadeIn(".panel-fade-in-out");
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [wallet, router, user]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <ContentWrapper className="panel-fade-in-out opacity-0">
      <ContentWrapperYAxisCenteredContent>
        <div className="text-3xl mb-8 font-heavy">choose your recipients</div>
        <div className="mb-4 font-heavy">
          <span className="text-red-400">{recipientCount} </span>
          recipients selected
        </div>
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
