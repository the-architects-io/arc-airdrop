"use client";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { useFormik } from "formik";
import { SYSTEM_USER_ID } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { formatNumberWithCommas } from "@/utils/formatting";
import { useCluster } from "@/hooks/cluster";
import {
  MaxNumberOfCnft,
  getMaxBufferSize,
  getMaxDepth,
  getMinimumMaxBufferSizeAndMaxDepthForCapacity,
  isValidMaxNumberOfCnftsInMerkleTree,
  maxNumberOfCnftsInMerkleTree,
} from "@/app/blueprint/utils/merkle-trees";
import { useUserData } from "@nhost/nextjs";
import { useQuery } from "@apollo/client";
import { GET_MERKLE_TREES_BY_USER_ID } from "@the-architects/blueprint-graphql";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  ALL_DEPTH_SIZE_PAIRS,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TreeOptions } from "@/types";
import { TreeCostOptionSelector } from "@/features/merkle-trees/tree-cost-option-selector";
import { Collection, TreeCreationMethod } from "@/app/blueprint/types";

export const TreeCreator = () => {
  const { cluster } = useCluster();
  const user = useUserData();
  const { connection } = useConnection();

  const [treeMaxDepth, setTreeMaxDepth] = useState<number | null>(null);
  const [treeMaxBufferSize, setTreeMaxBufferSize] = useState<number | null>(
    null
  );
  const [treeCanopyDepth, setTreeCanopyDepth] = useState<number | null>(null);
  const [treeProofLength, setTreeProofLength] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [treeCreationMethod, setTreeCreationMethod] = useState(
    TreeCreationMethod.CHEAPEST
  );
  const [hasCalcError, setHasCalcError] = useState(false);
  const [costInSol, setCostInSol] = useState<number | null>(null);
  const [treeCost, setTreeCost] = useState<number | null>(null);

  const findBestTreeCost = useCallback(
    async (
      creatorsCount: number,
      tokenCount: number
    ): Promise<{
      maxDepth: number;
      maxBufferSize: number;
      canopyDepth: number;
      cost: number;
    }> => {
      if (tokenCount <= 0 || tokenCount > 1073741824) {
        throw new Error("Invalid tokenCount");
      }

      const maxProofLength =
        creatorsCount > 1 ? 5 : creatorsCount === 1 ? 8 : 12;
      const maxCanopyDepth = 17;

      const { maxDepth: minDepth, maxBufferSize: minBufferSize } =
        getMinimumMaxBufferSizeAndMaxDepthForCapacity(tokenCount);

      let bestConfig = {
        maxDepth: 0,
        maxBufferSize: 0,
        canopyDepth: 0,
        requiredSpace: Number.MAX_VALUE,
      };

      for (const pair of ALL_DEPTH_SIZE_PAIRS) {
        if (pair.maxDepth >= minDepth && pair.maxBufferSize >= minBufferSize) {
          for (
            let canopyDepth = 0;
            canopyDepth <= Math.min(pair.maxDepth, maxCanopyDepth);
            canopyDepth++
          ) {
            const effectiveDepth = pair.maxDepth - canopyDepth;
            if (effectiveDepth <= maxProofLength) {
              const requiredSpace = getConcurrentMerkleTreeAccountSize(
                pair.maxDepth,
                pair.maxBufferSize,
                canopyDepth
              );

              if (
                requiredSpace < bestConfig.requiredSpace &&
                requiredSpace >= tokenCount
              ) {
                // Prefer smaller requiredSpace
                bestConfig = {
                  maxDepth: pair.maxDepth,
                  maxBufferSize: pair.maxBufferSize,
                  canopyDepth,
                  requiredSpace,
                };
              }
            }
          }
        }
      }

      if (bestConfig.requiredSpace < Number.MAX_VALUE) {
        const cost =
          (await connection.getMinimumBalanceForRentExemption(
            bestConfig.requiredSpace
          )) / LAMPORTS_PER_SOL;
        return { ...bestConfig, cost };
      } else {
        setHasCalcError(true);
        throw new Error(
          "No valid configuration found for the given tokenCount"
        );
      }
    },
    [connection]
  );

  function calculateSpaceRequired(options: TreeOptions): number {
    return getConcurrentMerkleTreeAccountSize(
      options.maxDepth,
      options.maxBufferSize,
      options.canopyDepth
    );
  }

  const findCheapestTreeCost = useCallback(
    async (creatorsCount: number, tokenCount: number): Promise<number> => {
      const { maxBufferSize, maxDepth } =
        getMinimumMaxBufferSizeAndMaxDepthForCapacity(tokenCount);
      const requiredSpace = calculateSpaceRequired({
        maxDepth,
        maxBufferSize,
        canopyDepth: 0,
      });
      const cost = await connection.getMinimumBalanceForRentExemption(
        requiredSpace
      );
      setTreeCanopyDepth(0);
      setTreeMaxDepth(maxDepth);
      setTreeMaxBufferSize(maxBufferSize);
      setTreeProofLength(maxDepth);

      return cost / LAMPORTS_PER_SOL;
    },
    [connection]
  );

  const handleCreateTree = useCallback(
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
        userId: user?.id as string,
      });
    },
    [cluster, user]
  );

  const formik = useFormik({
    initialValues: {
      maxNumberOfCnfts: 8,
      creatorCount: 1,
    },
    onSubmit: async ({ maxNumberOfCnfts }) => {
      if (!isValidMaxNumberOfCnftsInMerkleTree(maxNumberOfCnfts)) {
        throw new Error("Invalid max number of cnfts");
      }

      await handleCreateTree(maxNumberOfCnfts as MaxNumberOfCnft);
    },
  });

  const calculateCost = useCallback(async () => {
    try {
      setIsCalculating(true);
      setHasCalcError(false);
      let cost;
      let canopyDepth = 0;
      let maxDepth = 0;
      let maxBufferSize = 0;

      if (treeCreationMethod === TreeCreationMethod.CHEAPEST) {
        cost = await findCheapestTreeCost(
          formik.values.creatorCount,
          formik.values.maxNumberOfCnfts
        );
      } else if (treeCreationMethod === TreeCreationMethod.TRADABLE) {
        const result = await findBestTreeCost(
          formik.values.creatorCount,
          formik.values.maxNumberOfCnfts
        );
        cost = result.cost;
        canopyDepth = result.canopyDepth;
        maxDepth = result.maxDepth;
        maxBufferSize = result.maxBufferSize;
        setTreeCanopyDepth(canopyDepth);
        setTreeMaxDepth(maxDepth);
        setTreeMaxBufferSize(maxBufferSize);
        setTreeProofLength(maxDepth - canopyDepth);
      }

      if (!cost) {
        setHasCalcError(true);
        return;
      }

      setTreeCost(cost);
    } catch (error) {
      console.error(error);
      setHasCalcError(true);
    } finally {
      setIsCalculating(false);
    }
  }, [
    findBestTreeCost,
    findCheapestTreeCost,
    formik.values.creatorCount,
    formik.values.maxNumberOfCnfts,
    treeCreationMethod,
  ]);

  const calculateTreeCost = useCallback(async () => {
    if (
      treeMaxDepth === null ||
      treeMaxBufferSize === null ||
      treeCanopyDepth === null
    ) {
      return;
    }

    const requiredSpace = getConcurrentMerkleTreeAccountSize(
      treeMaxDepth,
      treeMaxBufferSize,
      treeCanopyDepth
    );
    const costInLamports = await connection.getMinimumBalanceForRentExemption(
      requiredSpace
    );
    const costInSol = costInLamports / LAMPORTS_PER_SOL;
    setTreeCost(costInSol);
    const arcFee = 0.1;
    setCostInSol(costInSol + arcFee);
  }, [connection, treeCanopyDepth, treeMaxBufferSize, treeMaxDepth]);

  useEffect(() => {
    calculateCost();
  }, [
    calculateCost,
    formik.values.creatorCount,
    formik.values.maxNumberOfCnfts,
    findBestTreeCost,
    findCheapestTreeCost,
  ]);

  useEffect(() => {
    if (treeCost) {
      const feeMultiplier = 1.15;
      const finalPrice = Math.round(treeCost * feeMultiplier * 1e9) / 1e9; // round to 9 decimal places

      setFinalPrice(finalPrice);
    }

    if (!treeCost) {
      calculateTreeCost();
    }
  }, [calculateTreeCost, connection, treeCost]);

  return (
    <div className="flex space-x-12">
      <div className="flex flex-col justify-center space-y-4">
        <SelectInputWithLabel
          value={formik.values.creatorCount}
          label="Number of creators"
          name="creatorCount"
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
          ]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Select number of creators"
          hideLabel={false}
        />
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
        {hasCalcError && (
          <div className="text-red-500 text-sm">invalid tree</div>
        )}
        <div>max depth: {treeMaxDepth}</div>
        <div>max buffer size: {treeMaxBufferSize}</div>
        <div>proof size: {treeProofLength}</div>
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
          disabled={isCalculating || hasCalcError}
        >
          <PlusCircleIcon className="w-6 h-6 mr-2" />
          Create Merkle Tree
        </SubmitButton>
      </div>
      <div className="flex flex-col justify-center space-y-4">
        <TreeCostOptionSelector
          treeCreationMethod={treeCreationMethod}
          setTreeCreationMethod={setTreeCreationMethod}
          isCalculating={isCalculating}
          setIsCalculating={setIsCalculating}
          finalPrice={finalPrice}
          setFinalPrice={setFinalPrice}
        />
      </div>
    </div>
  );
};
