"use client";
import { Airdrop, Job, StatusUUIDs } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";

import { GET_JOB_BY_ID } from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { Line } from "rc-progress";
import { useEffect, useState } from "react";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { ExecuteAirdrop } from "@/features/airdrop/flow-steps/execute-airdrop";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  airdropFlowSteps,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { AirdropStatus } from "@/features/airdrop/flow-steps/airdrop-status";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { LoadingPanel } from "@/features/loading-panel";

export default function AirdropDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const { setCurrentStep } = useAirdropFlowStep();

  const [isLoading, setIsLoading] = useState(true);
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const {
    loading,
    data,
  }: { loading: boolean; data: { jobs_by_pk: Job } | undefined } = useQuery(
    GET_JOB_BY_ID,
    {
      variables: {
        id: jobId,
      },
      skip: !jobId,
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    }
  );

  useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({ airdrops_by_pk }) => {
      setAirdrop(airdrops_by_pk);

      if (airdrops_by_pk?.job?.id) setJobId(airdrops_by_pk?.job?.id);
    },
  });

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

    setCurrentStep(airdropFlowSteps.ExecuteAirdrop);
    setIsLoading(false);
  }, [wallet, user, setCurrentStep, router]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  if (!params?.id)
    return (
      <ContentWrapper className="text-center">
        <div>Airdrop not found</div>
      </ContentWrapper>
    );

  return (
    <div className="w-full h-full min-h-screen text-stone-300">
      {!!data?.jobs_by_pk && airdrop?.id ? (
        <ContentWrapper>
          <ContentWrapperYAxisCenteredContent>
            <AirdropStatus
              airdropId={airdrop?.id}
              jobId={data?.jobs_by_pk?.id}
              setJob={(job) => {
                if (!job) {
                  setJobId(null);
                }
              }}
            />
          </ContentWrapperYAxisCenteredContent>
        </ContentWrapper>
      ) : (
        <ContentWrapper className="text-center">
          <div className="text-lg mb-4">
            {!!airdrop?.recipients?.length && (
              <ExecuteAirdrop airdrop={airdrop} setJobId={setJobId} />
            )}
          </div>
        </ContentWrapper>
      )}
    </div>
  );
}
