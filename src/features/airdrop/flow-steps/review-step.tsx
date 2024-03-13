import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  Airdrop,
  Collection,
  CollectionBuildSourceUUIDs,
  MerkleTree,
  Token,
  TreeCreationMethod,
} from "@/app/blueprint/types";
import { getMinimumMaxBufferSizeAndMaxDepthForCapacity } from "@/app/blueprint/utils/merkle-trees";
import { SOL_MINT_ADDRESS } from "@/app/blueprint/utils/payments";
import { BASE_URL } from "@/constants/constants";
import { MiniCnftCard } from "@/features/UI/cards/mini-cnft-card";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import Spinner from "@/features/UI/spinner";
import { StepHeading } from "@/features/UI/typography/step-heading";
import { StepTitle } from "@/features/UI/typography/step-title";
import { TreeCostOptionSelector } from "@/features/merkle-trees/tree-cost-option-selector";
import showToast from "@/features/toasts/show-toast";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useCluster } from "@/hooks/cluster";
import { TreeOptions } from "@/types";
import { getRecipientCountsFromAirdrop } from "@/utils/airdrop";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { isValidPublicKey } from "@/utils/rpc";
import { useQuery } from "@apollo/client";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import {
  ALL_DEPTH_SIZE_PAIRS,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  GET_COLLECTION_BY_ID,
  GET_MERKLE_TREES_BY_USER_ID,
} from "@the-architects/blueprint-graphql";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SOLANA_TRANSACTION_FEE = 0.000005;

export const ReviewStep = () => {
  const user = useUserData();
  const searchParams = useSearchParams();
  const { isSaving, setIsSaving } = useSaving();
  const wallet = useWallet();
  const { cluster } = useCluster();
  const router = useRouter();
  const { connection } = useConnection();
  const { setStepIsValid } = useAirdropFlowStep();

  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [airdropId, setAirdropId] = useState<string | null>(null);
  const [totalTokenCount, setTotalTokenCount] = useState<number>(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [uniqueRecipientCount, setUniqueRecipientCount] = useState<number>(0);
  const [costInSol, setCostInSol] = useState<number>(0);
  const [treeCost, setTreeCost] = useState<number | null>(null);
  const [storageCost, setStorageCost] = useState<number | null>(null);
  const [solPriceInUsd, setSolPriceInUsd] = useState<number | null>(null);
  const [hasCalcError, setHasCalcError] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [treeMaxDepth, setTreeMaxDepth] = useState<number | null>(null);
  const [treeMaxBufferSize, setTreeMaxBufferSize] = useState<number | null>(
    null
  );
  const [treeCreationMethod, setTreeCreationMethod] =
    useState<TreeCreationMethod | null>(null);
  const [treeCanopyDepth, setTreeCanopyDepth] = useState<number | null>(null);
  const [treeProofLength, setTreeProofLength] = useState<number | null>(null);
  const [premintTokensCount, setPremintTokensCount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [shouldUseExistingTree, setShouldUseExistingTree] =
    useState<boolean>(false);
  const [shouldUseExistingDrive, setShouldUseExistingDrive] =
    useState<boolean>(false);
  const [selectedTree, setSelectedTree] = useState<MerkleTree | null>(null);
  const [existingDriveAddress, setExistingDriveAddress] = useState<
    string | undefined
  >(undefined);

  const { data: userMerleTreesData } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "no-cache",
  });

  const { data: tokenData, refetch } = useQuery(
    GET_PREMINT_TOKENS_BY_COLLECTION_ID,
    {
      variables: {
        id: collectionId,
      },
      skip: !collectionId,
      fetchPolicy: "network-only",
      onCompleted: ({ tokens }: { tokens: Token[] }) => {
        const amountToMint = tokens.reduce(
          (acc: number, token: Token) => acc + (token?.amountToMint ?? 0),
          0
        );

        setPremintTokensCount(amountToMint);
      },
    }
  );

  const { loading: loadingCollection, data: collectionData } = useQuery(
    GET_COLLECTION_BY_ID,
    {
      variables: {
        id: collectionId,
      },
      skip: !collectionId,
      fetchPolicy: "network-only",
      onCompleted: ({
        collections_by_pk: collection,
      }: {
        collections_by_pk: Collection;
      }) => {
        console.log({ collection });
        setCollection(collection);
      },
    }
  );

  const { loading: loadingAirdrop, data: airdropData } = useQuery(
    GET_AIRDROP_BY_ID,
    {
      variables: {
        id: airdropId,
      },
      skip: !airdropId,
      fetchPolicy: "network-only",
      onCompleted: ({
        airdrops_by_pk: airdrop,
      }: {
        airdrops_by_pk: Airdrop;
      }) => {
        console.log({ airdrop });
        setAirdrop(airdrop);
        const { uniqueRecipients, recipientCount } =
          getRecipientCountsFromAirdrop(airdrop);
        setUniqueRecipientCount(uniqueRecipients);
        setRecipientCount(recipientCount);
      },
    }
  );

  function calculateSpaceRequired(options: TreeOptions): number {
    return getConcurrentMerkleTreeAccountSize(
      options.maxDepth,
      options.maxBufferSize,
      options.canopyDepth
    );
  }

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
        throw new Error(
          "No valid configuration found for the given tokenCount"
        );
      }
    },
    [connection]
  );

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

  const calculateTreeCost = useCallback(
    async (collection: Collection) => {
      if (!collection) {
        return null;
      }
      const { maxDepth, maxBufferSize, canopyDepth } = collection;
      if (!maxDepth || !maxBufferSize || !canopyDepth) {
        return null;
      }
      const requiredSpace = getConcurrentMerkleTreeAccountSize(
        maxDepth,
        maxBufferSize,
        canopyDepth
      );
      const costInLamports = await connection.getMinimumBalanceForRentExemption(
        requiredSpace
      );
      const costInSol = costInLamports / LAMPORTS_PER_SOL;
      setTreeCost(costInSol);
      const arcFee = 0.1;
      setCostInSol(costInSol + arcFee);
    },
    [connection]
  );

  const calculateStorageCost = useCallback(
    async (collection: Collection, tokenImagesSizeInBytes?: number) => {
      const storageCostPerGbInUsd = 0.05;
      const shdwDriveAllocationFeeInLamports = 3803200;

      const { imageSizeInBytes } = collection;

      let imagesSizeInBytes;

      if (tokenImagesSizeInBytes) {
        imagesSizeInBytes = tokenImagesSizeInBytes;
      } else {
        imagesSizeInBytes = imageSizeInBytes;
      }

      if (!imageSizeInBytes || !imagesSizeInBytes) {
        return null;
      }
      const oneMbInBytes = 1024 * 1024;

      const totalSizeInBytes =
        imageSizeInBytes + imagesSizeInBytes + oneMbInBytes;

      const costInUsd =
        (totalSizeInBytes / 1024 / 1024 / 1024) * storageCostPerGbInUsd;

      const {
        data: { solPriceInUsd, success },
      } = await axios.get(`${BASE_URL}/api/get-sol-price-in-usd`);

      if (!success) {
        return null;
      }

      const costInSolBeforeAllocationFee = costInUsd / solPriceInUsd;
      const costInSol =
        costInSolBeforeAllocationFee +
        shdwDriveAllocationFeeInLamports / LAMPORTS_PER_SOL;
      setSolPriceInUsd(solPriceInUsd);
      setStorageCost(costInSol);
    },
    []
  );

  const calculateCost = useCallback(async () => {
    const creatorCount = collection?.creators?.length || 1;

    if (totalTokenCount <= 0) {
      setIsCalculating(false);
      return;
    }

    try {
      setIsCalculating(true);
      setHasCalcError(false);
      let cost;
      let canopyDepth = 0;
      let maxDepth = 0;
      let maxBufferSize = 0;

      if (treeCreationMethod === TreeCreationMethod.CHEAPEST) {
        cost = await findCheapestTreeCost(creatorCount, totalTokenCount);
      } else if (treeCreationMethod === TreeCreationMethod.TRADABLE) {
        const result = await findBestTreeCost(creatorCount, totalTokenCount);
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
    collection?.creators?.length,
    findBestTreeCost,
    findCheapestTreeCost,
    totalTokenCount,
    treeCreationMethod,
  ]);

  const handleSolPayment = useCallback(
    async (amountInSol: number) => {
      if (!wallet || !airdropId) {
        console.error("Wallet or airdrop not found");
        return;
      }
      setIsSaving(true);
      const blueprint = createBlueprintClient({ cluster });

      // round to nearest lamport
      const baseAmount = Math.round(amountInSol * LAMPORTS_PER_SOL);

      try {
        const { txId } = await blueprint.payments.takePayment({
          wallet,
          mintAddress: SOL_MINT_ADDRESS,
          baseAmount,
          cluster,
        });
        if (txId) {
          await blueprint.airdrops.updateAirdrop({
            id: airdropId,
            hasBeenPaidFor: true,
          });
          showToast({
            primaryMessage: "Payment successful",
            link: {
              url: `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`,
              title: "View transaction",
            },
          });
          router.push(`${BASE_URL}/airdrop/execute/${airdropId}`);
          return;
        } else {
          showToast({
            primaryMessage: "Payment failed",
            secondaryMessage: "Please try again",
          });
          router.push(`${BASE_URL}/airdrop/review`); // remove query params
        }
      } catch (error) {
        console.error(error);
        showToast({
          primaryMessage: "Payment failed",
          secondaryMessage: "Please try again",
        });
        router.push(`${BASE_URL}/airdrop/review`); // remove query params
      } finally {
        setIsSaving(false);
      }
    },
    [wallet, airdropId, setIsSaving, cluster, router]
  );

  const updateCollectionWithTreeInfo = useCallback(async () => {
    if (!collection || !treeMaxDepth || !treeMaxBufferSize) {
      console.error("Collection or tree info not found");
      return;
    }
    const blueprint = createBlueprintClient({ cluster });

    const { METADATA_JSONS, PREMINT_TOKENS } = CollectionBuildSourceUUIDs;

    type CollectionBuildSourceIdType =
      | (typeof CollectionBuildSourceUUIDs)["METADATA_JSONS"]
      | (typeof CollectionBuildSourceUUIDs)["PREMINT_TOKENS"];

    const { success } = await blueprint.collections.updateCollection({
      tokenImagesSizeInBytes: tokenData.tokens.reduce(
        (acc: number, token: Token) =>
          acc + (Number(token?.imageSizeInBytes) || 0),
        0
      ),
      tokenCount: totalTokenCount,
      collectionBuildSourceId: PREMINT_TOKENS,
      id: collection.id,
      maxDepth: treeMaxDepth,
      maxBufferSize: treeMaxBufferSize,
      canopyDepth: treeCanopyDepth || 0,
      isReadyToMint: true,
    });
  }, [
    collection,
    treeMaxDepth,
    treeMaxBufferSize,
    cluster,
    tokenData?.tokens,
    treeCanopyDepth,
    totalTokenCount,
  ]);

  useEffect(() => {
    if (!finalPrice) return;
    if (searchParams.get("step") && searchParams.get("step") === "payment") {
      handleSolPayment(finalPrice);
    }
  }, [searchParams, finalPrice, handleSolPayment]);

  useEffect(() => {
    calculateCost();
  }, [
    calculateCost,
    collection?.creators?.length,
    findBestTreeCost,
    findCheapestTreeCost,
    totalTokenCount,
  ]);

  useEffect(() => {
    if (!collection || !tokenData) return;

    if (totalCost && treeCost && storageCost) {
      const feeMultiplier = 1.15;
      const finalPrice = Math.round(totalCost * feeMultiplier * 1e9) / 1e9; // round to 9 decimal places

      updateCollectionWithTreeInfo();

      setFinalPrice(finalPrice);
    }

    if (
      collection &&
      !treeCost &&
      collection?.maxDepth &&
      collection?.maxBufferSize
    ) {
      calculateTreeCost(collection);
    }

    const tokenImagesSizeInBytes = tokenData.tokens.reduce(
      (acc: number, token: Token) =>
        acc + (Number(token?.imageSizeInBytes) || 0),
      0
    );

    console.log({ tokenImagesSizeInBytes });

    if (
      collection &&
      !storageCost &&
      collection?.imageSizeInBytes &&
      tokenImagesSizeInBytes
    ) {
      calculateStorageCost(collection, tokenImagesSizeInBytes);
    }

    if (treeCost && storageCost && totalTokenCount) {
      setTotalCost(
        totalTokenCount * SOLANA_TRANSACTION_FEE + treeCost + storageCost
      );
    }
  }, [
    calculateStorageCost,
    calculateTreeCost,
    collection,
    connection,
    storageCost,
    tokenData,
    tokenData?.tokens,
    totalCost,
    totalTokenCount,
    treeCost,
    updateCollectionWithTreeInfo,
  ]);

  useEffect(() => {
    if (!window) return;

    const localAirdropId = localStorage.getItem("airdropId");
    const localCollectionId = localStorage.getItem("collectionId");
    if (!localAirdropId || !localCollectionId) {
      router.push("/");
      return;
    }
    if (localAirdropId) {
      setAirdropId(localAirdropId);
    }
    if (localCollectionId) {
      setCollectionId(localCollectionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasFillToken = tokenData?.tokens?.some(
      (token: Token) => token?.shouldFillRemaining
    );

    if (hasFillToken) {
      setTotalTokenCount(recipientCount);
    } else {
      setTotalTokenCount(premintTokensCount);
    }
  }, [premintTokensCount, recipientCount, tokenData?.tokens]);

  useEffect(() => {
    let capacityCanHoldAllTokens = true;
    let driveIsValid = true;
    if (shouldUseExistingTree) {
      capacityCanHoldAllTokens =
        (selectedTree?.maxCapacity || 0) >= totalTokenCount;
    } else {
      capacityCanHoldAllTokens = true;
    }

    if (shouldUseExistingDrive) {
      driveIsValid = existingDriveAddress?.length
        ? isValidPublicKey(existingDriveAddress)
        : false;
    } else {
      driveIsValid = true;
    }

    setStepIsValid(
      AirdropFlowStepName.Review,
      !!finalPrice &&
        !isCalculating &&
        !hasCalcError &&
        capacityCanHoldAllTokens &&
        driveIsValid
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    finalPrice,
    hasCalcError,
    isCalculating,
    recipientCount,
    shouldUseExistingDrive,
    shouldUseExistingTree,
    totalTokenCount,
    selectedTree,
    existingDriveAddress,
  ]);

  useEffect(() => {
    const blueprint = createBlueprintClient({ cluster });
    if (shouldUseExistingTree && selectedTree && collectionId) {
      blueprint.collections.updateCollection({
        id: collectionId,
        merkleTreeId: selectedTree.id,
      });
    } else if (collectionId) {
      blueprint.collections.updateCollection({
        id: collectionId,
        merkleTreeId: null,
      });
    }
  }, [cluster, collectionId, selectedTree, shouldUseExistingTree]);

  useEffect(() => {
    const blueprint = createBlueprintClient({ cluster });
    if (
      shouldUseExistingDrive &&
      existingDriveAddress?.length &&
      isValidPublicKey(existingDriveAddress) &&
      collectionId
    ) {
      blueprint.collections.updateCollection({
        id: collectionId,
        driveAddress: existingDriveAddress,
      });
    } else if (collectionId) {
      blueprint.collections.updateCollection({
        id: collectionId,
        driveAddress: null,
      });
    }
  }, [cluster, collectionId, existingDriveAddress, shouldUseExistingDrive]);

  return (
    <>
      <StepTitle>review</StepTitle>
      <div className="flex flex-wrap w-full mb-28 relative">
        <div className="flex flex-wrap gap-y-4 w-full md:w-2/3 px-4">
          {!!tokenData?.tokens?.length && (
            <>
              {tokenData.tokens.map((token: Token) => {
                return <MiniCnftCard token={token} key={token.id} />;
              })}
            </>
          )}
        </div>
        <div className="w-full md:w-1/3 flex flex-col px-4 ">
          <div className="space-y-8 mt-8">
            <StepHeading>
              <span className="text-red-500">{totalTokenCount}</span> cnfts to
              be created
            </StepHeading>
            <StepHeading>{recipientCount} recipients</StepHeading>
            <StepHeading>{uniqueRecipientCount} unique recipients</StepHeading>
            <StepHeading>
              {tokenData?.tokens?.length} cnft variation
              {tokenData?.tokens?.length > 1 ? "s" : ""}
            </StepHeading>
          </div>
          <div className="flex items-center space-x-4 my-8">
            <input
              type="checkbox"
              id="shouldUseExistingTree"
              name="shouldUseExistingTree"
              className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
              checked={shouldUseExistingTree}
              onChange={() => {
                setShouldUseExistingTree(!shouldUseExistingTree);
              }}
            />
            <label htmlFor="shouldUseExistingTree">use existing tree</label>
          </div>
          {shouldUseExistingTree ? (
            <>
              <SelectInputWithLabel
                value={selectedTree?.id || ""}
                label="Select tree"
                name="selectedTree"
                options={[
                  ...(
                    userMerleTreesData?.merkleTrees?.filter(
                      (tree: MerkleTree) => tree?.cluster === cluster
                    ) || []
                  ).map((tree: MerkleTree) => ({
                    label: `${getAbbreviatedAddress(
                      tree.address
                    )} - capacity: ${tree.maxCapacity}`,
                    value: tree.id,
                  })),
                ]}
                onChange={(e) => {
                  const selectedTreeId = e.target.value;
                  const selectedTree = userMerleTreesData?.merkleTrees.find(
                    (tree: MerkleTree) => tree.id === selectedTreeId
                  );
                  setSelectedTree(selectedTree);
                }}
                onBlur={() => {}}
                placeholder="Select tree"
                hideLabel={false}
              />
              {selectedTree && selectedTree.maxCapacity < totalTokenCount && (
                <div className="text-red-500 mt-2 text-sm">
                  capacity is not large enough
                </div>
              )}
            </>
          ) : (
            <TreeCostOptionSelector
              setTreeCreationMethod={setTreeCreationMethod}
              isCalculating={isCalculating}
              finalPrice={finalPrice}
            />
          )}
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="checkbox"
              id="shouldUseExistingDrive"
              name="shouldUseExistingDrive"
              className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
              checked={shouldUseExistingDrive}
              onChange={() => {
                setShouldUseExistingDrive(!shouldUseExistingDrive);
              }}
            />
            <label htmlFor="shouldUseExistingTree">use existing drive</label>
          </div>
          {shouldUseExistingDrive && (
            <div className="flex">
              <FormInputWithLabel
                label="drive address"
                name="driveAddress"
                value={existingDriveAddress}
                onChange={(e) => {
                  setExistingDriveAddress(e.target.value);
                }}
                description="the address of the drive to use"
              />
              {!!existingDriveAddress &&
              isValidPublicKey(existingDriveAddress) ? (
                <CheckBadgeIcon className="h-6 w-6 text-green-500 self-end ml-2 mb-10" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-500 self-end ml-2 mb-10" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
