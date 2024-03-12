"use client";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useCallback, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { useFormik } from "formik";
import { SYSTEM_USER_ID } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { formatNumberWithCommas } from "@/utils/formatting";
import { useCluster } from "@/hooks/cluster";
import {
  MaxNumberOfCnft,
  getMaxBufferSize,
  getMaxDepth,
  isValidMaxNumberOfCnftsInMerkleTree,
  maxNumberOfCnftsInMerkleTree,
} from "@/app/blueprint/utils/merkle-trees";

export const CreateSystemTree = ({ refetch }: { refetch: () => void }) => {
  const { cluster } = useCluster();

  const handleCreateSystemMerkleTree = useCallback(
    async (maxNumberOfCnfts: MaxNumberOfCnft) => {
      const maxDepth = getMaxDepth(Number(maxNumberOfCnfts) as MaxNumberOfCnft);
      const maxBufferSize = getMaxBufferSize(
        Number(maxNumberOfCnfts) as MaxNumberOfCnft
      );

      if (!maxDepth || !maxBufferSize) {
        throw new Error("Invalid max depth or max buffer size");
      }

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { merkleTreeAddress } = await blueprint.tokens.createTree({
        maxDepth,
        maxBufferSize,
        userId: SYSTEM_USER_ID,
      });

      showToast({
        primaryMessage: "Success",
        secondaryMessage: `Merkle tree created`,
        link: {
          url: `https://explorer.solana.com/address/${merkleTreeAddress}?cluster=${cluster}`,
          title: "View Explorer",
        },
      });

      refetch();
    },
    [cluster, refetch]
  );

  const formik = useFormik({
    initialValues: {
      maxNumberOfCnfts: 8,
    },
    onSubmit: async ({ maxNumberOfCnfts }) => {
      if (!isValidMaxNumberOfCnftsInMerkleTree(maxNumberOfCnfts)) {
        throw new Error("Invalid max number of cnfts");
      }

      await handleCreateSystemMerkleTree(maxNumberOfCnfts as MaxNumberOfCnft);
    },
  });

  return (
    <div className="flex flex-col justify-center space-y-4">
      <SelectInputWithLabel
        value={formik.values.maxNumberOfCnfts}
        label="Max number of CNFTs tree can hold"
        name="maxNumberOfCnfts"
        options={maxNumberOfCnftsInMerkleTree.map((maxNumber) => ({
          value: maxNumber.toString(),
          label: formatNumberWithCommas(maxNumber),
        }))}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder="Select max number of CNFTs"
        hideLabel={false}
      />
      <SubmitButton
        isSubmitting={formik.isSubmitting}
        onClick={formik.submitForm}
      >
        <PlusCircleIcon className="w-6 h-6 mr-2" />
        Create System Merkle Tree
      </SubmitButton>
    </div>
  );
};
