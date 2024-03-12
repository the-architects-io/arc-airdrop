"use client";
import { fadeIn } from "@/animations";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { LoadingPanel } from "@/features/loading-panel";
import { TreeCreator } from "@/features/merkle-trees/tree-creator";
import { UserTreeList } from "@/features/merkle-trees/user-tree-list";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_MERKLE_TREES_BY_USER_ID } from "@the-architects/blueprint-graphql";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TreeCreatorPage() {
  const user = useUserData();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [walletInitialized, setWalletInitialized] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "no-cache",
  });

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
    setIsLoading(false);
  }, [user, publicKey, walletInitialized, router]);

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
        <TreeCreator />
        <div className="text-2xl mt-12 mb-4">my trees</div>
        <UserTreeList refetch={refetch} trees={data?.merkleTrees} />
      </ContentWrapperYAxisCenteredContent>
    </ContentWrapper>
  );
}
