import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  Collection,
  JobIcons,
  StatusUUIDs,
  Token,
  UploadJob,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { CnftCard } from "@/features/UI/cards/cnft-card";
import { CnftPlaceholderCard } from "@/features/UI/cards/cnft-placeholder-card";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const CreateCnftsStep = () => {
  const { isSaving, setIsSaving } = useSaving();
  const { cluster } = useCluster();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [driveAddress, setDriveAddress] = useState<string | null>(null);
  const [job, setJob] = useState<UploadJob | null>(null);
  const user = useUserData();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [airdropId, setAirdropId] = useState<string | null>(null);

  const { data: tokenData, refetch } = useQuery(
    GET_PREMINT_TOKENS_BY_COLLECTION_ID,
    {
      variables: {
        id: collectionId,
      },
      fetchPolicy: "network-only",
    }
  );

  const { loading, data: collectionData } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: collectionId,
    },
    skip: !collectionId,
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
      if (!user?.id || !collectionId) {
        console.error("User or collection not found");
        setIsSaving(false);
        return;
      }
      setIsSaving(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      if (!collection?.id) {
        console.error("Collection not found");
        setIsSaving(false);
        return;
      }

      const collectionImageSizeInBytes = collection.imageSizeInBytes || 0;
      const tokenImagesSizeInBytes = tokenData.tokens.reduce(
        (acc: number, token: Token) =>
          acc + (Number(token?.imageSizeInBytes) || 0),
        0
      );

      const { job } = await blueprint.jobs.createUploadJob({
        statusText: "Creating SHDW Drive",
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

      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, status } = await axios.post(
            `${ARCHITECTS_API_URL}/create-drive`,
            {
              name: collectionId,
              sizeInKb,
              ownerAddress: EXECUTION_WALLET_ADDRESS,
            }
          );

          if (status !== 200) {
            throw new Error("Failed to create drive");
          }

          const { address, txSig } = data;

          console.log({ address, txSig });

          setDriveAddress(address);
          driveAddress = address;

          break;
        } catch (error) {
          if (attempt === maxRetries) {
            console.log({ error });
            console.error(`Failed to create drive: ${error}`);
            throw error;
          }
          console.error(`Attempt ${attempt} failed: ${error}`);
        }
      }

      if (!driveAddress) {
        setIsSaving(false);
        console.error("Failed to create drive");
        blueprint.jobs.updateUploadJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "Failed to create drive.",
          cluster,
        });
        return;
      }

      if (!collection.imageUrl?.length) {
        blueprint.jobs.updateUploadJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "Collection image is missing",
          cluster,
        });
        return;
      }

      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.IN_PROGRESS,
        statusText: "Uploading files to SHDW Drive",
        cluster,
      });

      for (const token of tokenData.tokens as Token[]) {
        console.log({ token });

        if (!token.image || !token.id) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Token image is missing",
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
            statusText: "Failed to fetch token image",
            cluster,
          });
          return;
        }

        console.log({ file, driveAddress, token });

        const { success, url } = await blueprint.upload.uploadFile({
          driveAddress,
          file,
          fileName: token.id,
        });

        token.image = url;

        if (!success) {
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Failed to upload token image",
            cluster,
          });
          return;
        }
      }

      const { success: successOne } =
        await blueprint.collections.updateCollection({
          id: collectionId,
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
        console.error("Failed to update collection");
        return;
      }

      router.push(`/review`);
    },
  });

  useEffect(() => {
    if (!tokenData?.tokens?.length) return;
    if (formik.values.tokens.length) return;

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
  }, [formik, tokenData]);

  useEffect(() => {
    const localAirdropId = localStorage.getItem("airdropId");
    const localCollectionId = localStorage.getItem("collectionId");

    if (localAirdropId) {
      setAirdropId(localAirdropId);
    }
    if (localCollectionId) {
      setCollectionId(localCollectionId);
    }
  }, []);

  return (
    <>
      <StepTitle>create compressed nfts</StepTitle>
      <StepSubtitle>0 / 15,000 cnfts created</StepSubtitle>
      <div className="flex flex-wrap w-full min-h-full pb-28">
        <CnftPlaceholderCard />
        <>
          {!!tokenData?.tokens?.length && !!formik.values.tokens.length && (
            <>
              {tokenData.tokens.map((token: Token) => {
                return (
                  <CnftCard refetch={refetch} token={token} key={token.id} />
                );
              })}
            </>
          )}
        </>
      </div>
    </>
  );
};
