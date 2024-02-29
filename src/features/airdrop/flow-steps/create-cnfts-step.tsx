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
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { useFormik } from "formik";
import Image from "next/image";
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

  const { data: tokenData } = useQuery(GET_PREMINT_TOKENS_BY_COLLECTION_ID, {
    variables: {
      id: collectionId,
    },
    fetchPolicy: "no-cache",
  });

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
        <CnftCard />
        <>
          {!!tokenData?.tokens?.length && !!formik.values.tokens.length && (
            <>
              {tokenData.tokens.map((token: Token) => {
                return (
                  <div
                    className="w-full sm:w-1/2 lg:w-1/3 flex flex-col mb-4"
                    key={token.id}
                  >
                    <div className="mx-4 h-full min-h-full">
                      <div className="shadow-deep rounded-md hover:rounded-md border border-gray-400 w-full flex flex-col flex-1 h-full min-h-full">
                        <Image
                          src={token.image}
                          alt={token.name}
                          height={800}
                          width={800}
                          objectFit="cover"
                          className="w-full rounded-t-md aspect-square"
                        />
                        <div className="flex flex-col flex-grow bg-gray-500 rounded-b-md">
                          <div className="p-4 w-full space-y-2 flex-grow">
                            <FormInputWithLabel
                              className="text-gray-100 text-base"
                              label="name"
                              name="name"
                              placeholder="e.g. my nft"
                              value={token.name}
                              disabled
                            />
                            <FormTextareaWithLabel
                              className="text-gray-100 text-base"
                              label="description"
                              name="description"
                              placeholder="e.g. my nft description"
                              value={token.description}
                              disabled
                            />
                            <FormInputWithLabel
                              className="text-gray-100 text-base"
                              label="link"
                              name="link"
                              placeholder="e.g. my nft"
                              value={token.external_url}
                              disabled
                            />
                          </div>
                          <div className="flex w-full justify-between items-center p-4">
                            <button
                              className="rounded-full bg-gray-500 p-2"
                              disabled
                            >
                              <TrashIcon className="w-8 h-8 text-gray-500" />
                            </button>
                            <div>
                              <div className="text-4xl text-cyan-400">
                                {token.amountToMint || 0}
                              </div>
                            </div>
                            <button className="rounded-full bg-cyan-400 hover:bg-cyan-500 p-2">
                              <TrashIcon className="w-8 h-8 text-gray-100" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      </div>
    </>
  );
};
