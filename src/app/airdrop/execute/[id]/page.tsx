"use client";
import { Airdrop, Collection, Job, StatusUUIDs } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";

import {
  GET_COLLECTION_BY_ID,
  GET_JOB_BY_ID,
  GET_UPLOAD_JOB_BY_ID,
} from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { ExecuteAirdrop } from "@/features/airdrop/flow-steps/execute-airdrop";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAirdropFlowStep } from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { AirdropStatus } from "@/features/airdrop/flow-steps/airdrop-status";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { LoadingPanel } from "@/features/loading-panel";
import { useCluster } from "@/hooks/cluster";
import LogViewer from "@/features/logs/log-viewer";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import classNames from "classnames";

export default function AirdropDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const { publicKey } = useWallet();
  const router = useRouter();
  const { setCurrentStep, airdropFlowSteps } = useAirdropFlowStep();
  const { cluster } = useCluster();
  const [walletInitialized, setWalletInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [shouldShowLog, setShouldShowLog] = useState(false);

  const {
    loading,
    data: jobData,
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

  const { error, data: uploadJobData } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: uploadJobId,
    },
    skip: !uploadJobId,
    pollInterval: 1000,
    fetchPolicy: "no-cache",
  });

  const { data: airdropData, refetch: refetchAirdrop } = useQuery(
    GET_AIRDROP_BY_ID,
    {
      variables: {
        id: params?.id,
      },
      skip: !params?.id,
      fetchPolicy: "no-cache",
      onCompleted: ({ airdrops_by_pk }) => {
        setAirdrop(airdrops_by_pk);

        if (airdrops_by_pk?.job?.id) setJobId(airdrops_by_pk?.job?.id);
      },
    }
  );

  const {
    loading: loadingCollection,
    data: collectionData,
    refetch: refetchCollection,
  } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: airdrop?.collection?.id,
    },
    skip: !airdrop?.collection?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      console.log({ collection });
      setCollection(collection);
    },
  });

  const handleRefetch = () => {
    refetchAirdrop();
    refetchCollection();
  };

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

    setCurrentStep(airdropFlowSteps.ExecuteAirdrop);
    setIsLoading(false);
  }, [
    user,
    publicKey,
    walletInitialized,
    router,
    setCurrentStep,
    airdropFlowSteps.ExecuteAirdrop,
  ]);

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
    <>
      <div
        className={classNames([
          "w-full h-full min-h-screen absolute bg-slate-200 bg-opacity-80 z-10 overflow-y-auto",
          shouldShowLog ? "block" : "hidden",
        ])}
      >
        <LogViewer close={() => setShouldShowLog(false)} />
      </div>
      <div className="w-full h-full min-h-screen text-gray-400">
        {(jobData?.jobs_by_pk?.id || uploadJobData?.uploadJobs_by_pk?.id) &&
        airdrop?.id &&
        collection?.id ? (
          <ContentWrapper>
            <ContentWrapperYAxisCenteredContent>
              <AirdropStatus
                refetch={handleRefetch}
                airdrop={airdropData?.airdrops_by_pk}
                collection={collectionData?.collections_by_pk}
                jobId={jobData?.jobs_by_pk?.id}
                uploadJobId={uploadJobData?.uploadJobs_by_pk?.id}
              />
              <PrimaryButton
                onClick={() => setShouldShowLog(true)}
                className="mt-8"
              >
                show logs
              </PrimaryButton>
            </ContentWrapperYAxisCenteredContent>
          </ContentWrapper>
        ) : (
          <ContentWrapper className="text-center">
            {!!airdrop?.recipients?.length && !!collection?.id && (
              <ExecuteAirdrop
                airdrop={airdrop}
                collection={collection}
                setJobId={setJobId}
                setUploadJobId={setUploadJobId}
              />
            )}
          </ContentWrapper>
        )}
      </div>
    </>
  );
}
