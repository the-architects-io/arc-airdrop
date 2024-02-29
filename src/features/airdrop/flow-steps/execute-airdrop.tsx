import { createBlueprintClient } from "@/app/blueprint/client";
import {
  Airdrop,
  JobIcons,
  JobTypeUUIDs,
  StatusUUIDs,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  EXECUTION_WALLET_ADDRESS,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";

import { useCluster } from "@/hooks/cluster";

import { useUserData } from "@nhost/nextjs";
import axios from "axios";

import { useCallback, useState } from "react";

export const ExecuteAirdrop = ({
  airdrop,
  setJobId,
}: {
  airdrop: Airdrop;
  setJobId: (jobId: string) => void;
}) => {
  const user = useUserData();
  const [isDisabled, setIsDisabled] = useState(false);
  const { cluster } = useCluster();

  const blueprint = createBlueprintClient({ cluster });

  const mintCollectionNft = useCallback(async () => {
    const {
      name,
      symbol,
      description,
      sellerFeeBasisPoints,
      driveAddress,
      imageUrl,
      id,
      maxBufferSize,
      maxDepth,
      canopyDepth,
    } = airdrop.collection;

    if (
      !name ||
      !sellerFeeBasisPoints ||
      !user ||
      !maxBufferSize ||
      !maxDepth
    ) {
      console.log("Missing collection data");
      return;
    }

    let uri = "";

    const { success, job } = await blueprint.jobs.createJob({
      statusId: StatusUUIDs.IN_PROGRESS,
      statusText: "Minting collection NFT",
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
      console.log("Failed to create job");
      return;
    }

    setJobId(job.id);

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Uploading collection NFT metadata",
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
        statusText: "Failed to upload collection NFT metadata",
        icon: JobIcons.ERROR,
      });
      console.error("Error uploading collection NFT metadata", error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Minting collection NFT",
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

      console.log("minting collection NFT", {
        signature,
        mintAddress,
      });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to mint collection NFT",
        icon: JobIcons.ERROR,
      });
      console.error("Error minting collection NFT", error);
    }

    await blueprint.jobs.updateJob({
      id: job.id,
      statusText: "Creating merkle tree",
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

    try {
      const { data, status } = await axios.post(
        `${ARCHITECTS_API_URL}/create-tree`,
        {
          maxBufferSize: maxBufferSize,
          maxDepth: maxDepth,
          canopyDepth: canopyDepth,
          collectionId: airdrop.collection.id,
          userId: SYSTEM_USER_ID,
          cluster,
        }
      );

      treeId = data.id;

      console.log({
        data,
        status,
        treeId,
      });

      if (!success) throw new Error("Error creating Merkle Tree");
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to create merkle tree",
        icon: JobIcons.ERROR,
      });
      console.error("Error creating merkle tree", error);
    }

    if (!collectionNftMintAddress) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to mint collection NFT",
        icon: JobIcons.ERROR,
      });
      return;
    }

    try {
      const { success } = await blueprint.collections.updateCollection({
        id,
        collectionNftAddress: collectionNftMintAddress,
        merkleTreeId: treeId,
      });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to update collection NFT address",
        icon: JobIcons.ERROR,
      });
      console.error("Error updating collection NFT address", error);
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

      const {
        recipientWalletAddresses,
        signatures,
      }: {
        metadatas: string[];
        recipientWalletAddresses: string[];
        merkleTreeAddress: string;
        collectionNftAddress: string;
        creators: string[];
        signatures: string[];
      } = data;

      console.log({
        signatureCount: signatures.length,
        recipientCount: recipientWalletAddresses.length,
      });
    } catch (error) {
      blueprint.jobs.updateJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to airdrop collection NFTs",
        icon: JobIcons.ERROR,
      });
      console.error("Error airdropping collection NFTs", error);
    }
  }, [
    airdrop.collection,
    airdrop.id,
    blueprint.airdrops,
    blueprint.collections,
    blueprint.jobs,
    blueprint.upload,
    cluster,
    setJobId,
    user,
  ]);

  const handleExecuteAirdrop = () => {
    setIsDisabled(true);

    mintCollectionNft();
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center">
      <SubmitButton
        onClick={handleExecuteAirdrop}
        disabled={isDisabled}
        isSubmitting={isDisabled}
      >
        Execute
      </SubmitButton>
    </ContentWrapper>
  );
};
