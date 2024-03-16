import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  Airdrop,
  Collection,
  JobIcons,
  StatusUUIDs,
  Token,
  UploadJob,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { CnftCard } from "@/features/UI/cards/cnft-card";
import { CnftPlaceholderCard } from "@/features/UI/cards/cnft-placeholder-card";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useCluster } from "@/hooks/cluster";
import { getRecipientCountsFromAirdrop } from "@/utils/airdrop";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const CreateCnftsStep = ({ airdrop }: { airdrop: Airdrop }) => {
  const { isSaving, setIsSaving } = useSaving();
  const { setStepIsValid } = useAirdropFlowStep();
  const { cluster } = useCluster();
  const router = useRouter();
  const [driveAddress, setDriveAddress] = useState<string | null>(null);
  const [job, setJob] = useState<UploadJob | null>(null);
  const user = useUserData();
  const [airdropId, setAirdropId] = useState<string | null>(null);
  const [totalTokenCount, setTotalTokenCount] = useState<number>(0);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [hasFillerToken, setHasFillerToken] = useState<boolean>(false);

  const { data: tokenData, refetch } = useQuery(
    GET_PREMINT_TOKENS_BY_COLLECTION_ID,
    {
      variables: {
        id: airdrop?.collection?.id,
      },
      skip: !airdrop?.collection?.id,
      fetchPolicy: "network-only",
    }
  );

  const { loading, data: collectionData } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: airdrop?.collection?.id,
    },
    skip: !airdrop?.collection?.id,
    fetchPolicy: "no-cache",
  });

  const formik = useFormik({
    initialValues: {
      tokens:
        tokenData?.tokens?.map(
          (token: Token) =>
            ({
              id: token.id,
              amountToMint: token.amountToMint,
              imageSizeInBytes: token.imageSizeInBytes,
            } as Token)
        ) || [],
    },
    onSubmit: async (values) => {
      if (!user?.id || !airdrop?.collection?.id) {
        console.error("user or collection not found");
        setIsSaving(false);
        return;
      }
      setIsSaving(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      if (!collectionData?.collections_by_pk?.id) {
        console.error("collection not found");
        setIsSaving(false);
        return;
      }

      const collectionImageSizeInBytes =
        collectionData.collections_by_pk.imageSizeInBytes || 0;
      const tokenImagesSizeInBytes = tokenData.tokens.reduce(
        (acc: number, token: Token) =>
          acc + (Number(token?.imageSizeInBytes) || 0),
        0
      );

      const { job } = await blueprint.jobs.createUploadJob({
        statusText: "creating shdw drive",
        userId: user?.id,
        icon: JobIcons.CREATING_SHADOW_DRIVE,
        cluster,
      });

      setJob(job);

      const sizeInKb =
        Math.ceil(
          (collectionImageSizeInBytes + tokenImagesSizeInBytes) / 1024
        ) + 1000;

      console.log({
        sizeInKb,
        collectionImageSizeInBytes,
        tokenImagesSizeInBytes,
      });

      let driveAddress: string | null = null;

      if (!collectionData.collections_by_pk.imageUrl?.length) {
        blueprint.jobs.updateUploadJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "collection image is missing",
          cluster,
        });
        return;
      }

      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.IN_PROGRESS,
        statusText: "uploading files to shdw drive",
        cluster,
      });

      for (const token of tokenData.tokens as Token[]) {
        console.log({ token });

        if (!token.image || !token.id) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "token image is missing",
            cluster,
          });
          return;
        }

        const file = await blueprint.files.createFileFromUrl({
          url: token.image,
          fileName: token.id,
        });

        if (!file) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "failed to fetch token image",
            cluster,
          });
          return;
        }

        console.log({ file, driveAddress, token });

        const { success, url } = await blueprint.upload.uploadFile({
          driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
          file,
          fileName: token.id,
        });

        token.image = url;

        if (!success) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "failed to upload token image",
            cluster,
          });
          return;
        }
      }

      const { success: successOne } =
        await blueprint.collections.updateCollection({
          id: airdrop?.collection?.id,
          driveAddress,
          tokenImagesSizeInBytes,
          tokenCount: values.tokens.reduce(
            (acc: number, token: Token) =>
              acc + (Number(token?.amountToMint) || 0),
            0
          ),
        });

      const { success: successTwo, tokens } =
        await blueprint.tokens.updateTokens({
          tokens: values.tokens,
        });

      if (!successOne || !successTwo) {
        setIsSaving(false);
        console.error("failed to update collection");
        return;
      }

      router.push(`/review`);
    },
  });

  useEffect(() => {
    const { uniqueRecipients, recipientCount } =
      getRecipientCountsFromAirdrop(airdrop);
    setRecipientCount(recipientCount);
  }, [airdrop]);

  useEffect(() => {
    if (!tokenData?.tokens?.length) return;
    if (formik.values.tokens.length) return;

    const amountToMint = tokenData.tokens.reduce(
      (acc: number, token: Token) => acc + (token?.amountToMint ?? 0),
      0
    );

    const hasFillerToken = tokenData.tokens.some(
      (token: Token) => token.shouldFillRemaining
    );

    setHasFillerToken(hasFillerToken);
    setTotalTokenCount(amountToMint + totalTokenCount);

    formik.setValues({
      tokens:
        tokenData?.tokens?.map(
          (token: Token) =>
            ({
              id: token.id,
              amountToMint: token.amountToMint,
            } as Token)
        ) || [],
    });
  }, [formik, tokenData, totalTokenCount]);

  useEffect(() => {
    setStepIsValid(
      AirdropFlowStepName.CreateNfts,
      !!formik.values.tokens.length &&
        !isSaving &&
        (recipientCount === totalTokenCount || hasFillerToken)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.tokens.length,
    hasFillerToken,
    isSaving,
    recipientCount,
    totalTokenCount,
  ]);

  return (
    <>
      <StepTitle>create compressed nfts</StepTitle>
      <StepSubtitle>
        {hasFillerToken ? recipientCount : totalTokenCount} / {recipientCount}{" "}
        cnfts created
      </StepSubtitle>
      <div className="flex flex-wrap w-full min-h-full pb-28">
        <CnftPlaceholderCard airdropId={airdrop?.id} />
        <>
          {!!tokenData?.tokens?.length && !!formik.values.tokens.length && (
            <>
              {tokenData.tokens.map((token: Token) => {
                return (
                  <CnftCard
                    refetch={() => {
                      refetch();
                      setTotalTokenCount(0);
                    }}
                    token={token}
                    key={token.id}
                  />
                );
              })}
            </>
          )}
        </>
      </div>
    </>
  );
};
