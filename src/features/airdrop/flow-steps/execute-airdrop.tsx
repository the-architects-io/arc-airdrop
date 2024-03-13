import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  Airdrop,
  Collection,
  Job,
  JobIcons,
  JobTypeUUIDs,
  StatusUUIDs,
  Token,
  UploadJob,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  EXECUTION_WALLET_ADDRESS,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { LoadingPanel } from "@/features/loading-panel";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";

import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";

import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";

import { useCallback, useEffect, useState } from "react";

export const ExecuteAirdrop = ({
  airdrop,
  collection,
  setJobId,
  setUploadJobId,
}: {
  airdrop: Airdrop;
  collection: Collection;
  setJobId: (jobId: string) => void;
  setUploadJobId: (jobId: string) => void;
}) => {
  const user = useUserData();
  const [isDisabled, setIsDisabled] = useState(false);
  const { cluster } = useCluster();
  const { isSaving, setIsSaving } = useSaving();
  const [driveAddress, setDriveAddress] = useState<string | null>(null);

  const { data: tokenData } = useQuery(GET_PREMINT_TOKENS_BY_COLLECTION_ID, {
    variables: {
      id: collection?.id,
    },
    skip: !collection?.id,
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      console.log({ data });
    },
  });

  const mintCollectionNft = useCallback(async () => {
    const {
      name,
      symbol,
      description,
      sellerFeeBasisPoints,
      imageUrl,
      id,
      maxBufferSize,
      maxDepth,
      canopyDepth,
    } = airdrop.collection;

    console.log({
      name,
      symbol,
      description,
      sellerFeeBasisPoints,
      imageUrl,
      id,
      maxBufferSize,
      maxDepth,
      canopyDepth,
      user,
    });

    if (
      !name ||
      !user ||
      !maxBufferSize ||
      !maxDepth ||
      !tokenData?.tokens?.length ||
      sellerFeeBasisPoints < 0 ||
      sellerFeeBasisPoints > 10000
    ) {
      console.log("Missing required fields");
      return;
    }

    setIsSaving(true);

    let uri = "";

    const blueprint = createBlueprintClient({ cluster });

    const collectionImageSizeInBytes = collection.imageSizeInBytes || 0;
    const tokenImagesSizeInBytes = tokenData.tokens.reduce(
      (acc: number, token: Token) =>
        acc + (Number(token?.imageSizeInBytes) || 0),
      0
    );

    const { job: uploadJob } = await blueprint.jobs.createUploadJob({
      statusText: "creating shdw drive",
      userId: user?.id,
      icon: JobIcons.CREATING_SHADOW_DRIVE,
      cluster,
    });

    setUploadJobId(uploadJob.id);

    const sizeInKb =
      Math.ceil((collectionImageSizeInBytes + tokenImagesSizeInBytes) / 1024) +
      1000;

    console.log({
      sizeInKb,
      collectionImageSizeInBytes,
      tokenImagesSizeInBytes,
    });

    let driveAddress: string | null = collection.driveAddress;

    if (!driveAddress) {
      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, status } = await axios.post(
            `${ARCHITECTS_API_URL}/create-drive`,
            {
              name: collection.id,
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
            console.error("failed to create drive", error);
            throw error;
          }
          console.error(`Attempt ${attempt} failed: ${error}`);
        }
      }

      if (!driveAddress) {
        setIsSaving(false);
        console.error("failed to create drive");
        blueprint.jobs.updateUploadJob({
          id: uploadJob.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "failed to create drive",
          cluster,
        });
        return;
      }
    }

    if (!collection.imageUrl?.length) {
      blueprint.jobs.updateUploadJob({
        id: uploadJob.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "collection image is missing",
        cluster,
      });
      return;
    }

    blueprint.jobs.updateUploadJob({
      id: uploadJob.id,
      statusId: StatusUUIDs.IN_PROGRESS,
      statusText: "uploading files to shdw drive",
      cluster,
    });

    for (const token of tokenData.tokens as Token[]) {
      console.log({ token });

      if (!token.image || !token.id) {
        blueprint.jobs.updateUploadJob({
          id: uploadJob.id,
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
          id: uploadJob.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "failed to fetch token image",
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
          id: uploadJob.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "failed to upload token image",
          cluster,
        });
        return;
      }
    }

    const { success: collectionUpdateSuccess } =
      await blueprint.collections.updateCollection({
        id: collection.id,
        driveAddress,
      });

    if (!collectionUpdateSuccess) {
      setIsSaving(false);
      console.error("failed to update collection drive address");
      return;
    }

    blueprint.jobs.updateUploadJob({
      id: uploadJob.id,
      statusId: StatusUUIDs.COMPLETE,
      cluster,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { success, job } = await blueprint.jobs.createJob({
      statusId: StatusUUIDs.IN_PROGRESS,
      statusText: "minting collection nft",
      userId: user.id,
      jobTypeId: JobTypeUUIDs.AIRDROP,
      icon: JobIcons.COLLECTION_IMAGE,
      cluster,
    });

    const { success: airdropUpdateSuccess } =
      await blueprint.airdrops.updateAirdrop({
        id: airdrop.id,
        jobId: job.id,
        cluster,
      });

    if (!success || !job?.id) {
      console.log("failed to create job");
      return;
    }

    setJobId(job.id);

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "uploading collection nft metadata",
      icon: JobIcons.UPLOADING_FILES,
    });

    const jsonFile = new Blob(
      [
        JSON.stringify({
          name,
          symbol,
          description,
          seller_fee_basis_points: sellerFeeBasisPoints,
          image: imageUrl,
        }),
      ],
      {
        type: "application/json",
      }
    );
    console.log({ jsonFile });

    try {
      const { url } = await blueprint.upload.uploadJson({
        file: jsonFile,
        fileName: `${id}-collection.json`,
        driveAddress,
      });

      uri = url;
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "failed to upload collection NFT metadata",
        icon: JobIcons.ERROR,
      });
      console.error("error uploading collection NFT metadata", error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "minting collection nft",
      icon: JobIcons.MINTING_NFTS,
    });

    let collectionNftMintAddress;

    try {
      const { data, status } = await axios.post(
        `${ARCHITECTS_API_URL}/mint-nft`,
        {
          name,
          uri,
          sellerFeeBasisPoints,
          isCollection: true,
          creatorAddress: EXECUTION_WALLET_ADDRESS,
          cluster,
        }
      );

      const { signature, result, mintAddress } = data;
      collectionNftMintAddress = mintAddress;

      console.log("minting collection nft", {
        signature,
        mintAddress,
      });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to mint collection nft",
        icon: JobIcons.ERROR,
      });
      console.error("Error minting collection nft", error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "creating merkle tree",
      icon: JobIcons.CREATING_TREE,
    });

    let treeId;

    console.log({
      maxBufferSize,
      maxDepth,
      canopyDepth,
      collectionId: airdrop.collection.id,
      userId: SYSTEM_USER_ID,
    });

    if (!airdrop.collection.merkleTree?.id) {
      try {
        const { data, status } = await axios.post(
          `${ARCHITECTS_API_URL}/create-tree`,
          {
            maxBufferSize: maxBufferSize,
            maxDepth: maxDepth,
            canopyDepth: canopyDepth,
            collectionId: airdrop.collection.id,
            userId: user.id,
            cluster,
          }
        );

        treeId = data.id;

        console.log({
          data,
          status,
          treeId,
        });

        if (!success) throw new Error("error creating merkle tree");
      } catch (error) {
        blueprint.jobs.updateJob({
          id: job.id,
          statusId: StatusUUIDs.ERROR,
          statusText: "failed to create merkle tree",
          icon: JobIcons.ERROR,
        });
        console.error("error creating merkle tree", error);
      }
    }

    if (!collectionNftMintAddress) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "failed to mint collection nft",
        icon: JobIcons.ERROR,
      });
      return;
    }

    try {
      const { success } = await blueprint.collections.updateCollection({
        id,
        collectionNftAddress: collectionNftMintAddress,
        uploadJobId: uploadJob.id,
        merkleTreeId: treeId,
      });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "failed to update collection nft address",
        icon: JobIcons.ERROR,
      });
      console.error("Error updating collection nft address", error);
    }

    try {
      const { data, status } = await axios.post(
        `${ARCHITECTS_API_URL}/airdrop-cnfts`,
        {
          airdropId: airdrop.id,
          jobId: job.id,
          cluster,
        }
      );

      console.log({ data, status });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "failed to airdrop collection nfts",
        icon: JobIcons.ERROR,
      });
      console.error("Error airdropping collection nfts", error);
    }
  }, [
    airdrop?.collection,
    airdrop?.id,
    cluster,
    collection?.id,
    collection?.imageSizeInBytes,
    collection?.imageUrl?.length,
    setIsSaving,
    setJobId,
    setUploadJobId,
    tokenData?.tokens,
    user,
  ]);

  useEffect(() => {
    if (airdrop?.id && collection?.id) {
      mintCollectionNft();
    }
  }, [airdrop?.id, collection?.id, mintCollectionNft]);

  if (!airdrop || !collection) {
    return <LoadingPanel />;
  }
};
