import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import {
  Airdrop,
  Collection,
  CollectionBuildSourceUUIDs,
  Token,
  TreeCreationMethod,
} from "@/app/blueprint/types";
import { getMinimumMaxBufferSizeAndMaxDepthForCapacity } from "@/app/blueprint/utils/merkle-trees";
import { SOL_MINT_ADDRESS } from "@/app/blueprint/utils/payments";
import { BASE_URL } from "@/constants/constants";
import { MiniCnftCard } from "@/features/UI/cards/mini-cnft-card";
import Spinner from "@/features/UI/spinner";
import { StepHeading } from "@/features/UI/typography/step-heading";
import { StepTitle } from "@/features/UI/typography/step-title";
import showToast from "@/features/toasts/show-toast";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import { useCluster } from "@/hooks/cluster";
import { TreeOptions } from "@/types";
import { getRecipientCountsFromAirdrop } from "@/utils/airdrop";
import { useQuery } from "@apollo/client";
import {
  ALL_DEPTH_SIZE_PAIRS,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SOLANA_TRANSACTION_FEE = 0.000005;

const treeCreationMethodOptions = [
  {
    value: TreeCreationMethod.CHEAPEST,
    label: "Cheapest",
  },
  {
    value: TreeCreationMethod.TRADABLE,
    label: "Trading Platform Friendly",
  },
];

export const ReviewStep = () => {
  const searchParams = useSearchParams();
  const { isSaving, setIsSaving } = useSaving();
  const wallet = useWallet();
  const { cluster } = useCluster();
  const router = useRouter();
  const { connection } = useConnection();

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
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [hasCalcError, setHasCalcError] = useState<boolean>(false);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [treeMaxDepth, setTreeMaxDepth] = useState<number | null>(null);
  const [treeMaxBufferSize, setTreeMaxBufferSize] = useState<number | null>(
    null
  );
  const [treeCanopyDepth, setTreeCanopyDepth] = useState<number | null>(null);
  const [treeProofLength, setTreeProofLength] = useState<number | null>(null);

  const { data: tokenData, refetch } = useQuery(
    GET_PREMINT_TOKENS_BY_COLLECTION_ID,
    {
      variables: {
        id: collectionId,
      },
      fetchPolicy: "network-only",
      onCompleted: ({ tokens }: { tokens: Token[] }) => {
        const amountToMint = tokens.reduce(
          (acc: number, token: Token) => acc + (token?.amountToMint ?? 0),
          0
        );

        setTotalTokenCount(amountToMint + totalTokenCount);
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

  const formik = useFormik({
    initialValues: {
      treeCreationMethod: TreeCreationMethod.CHEAPEST,
    },
    onSubmit: async (values) => {
      if (!airdropId || !collectionId) {
        console.error("Airdrop or collection not found");
        return;
      }
    },
  });

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

      const costInSol = costInUsd / solPriceInUsd;
      setSolPriceInUsd(solPriceInUsd);
      setStorageCost(costInSol);
    },
    []
  );

  const calculateCost = useCallback(async () => {
    const creatorCount = collection?.creators?.length || 1;

    if (totalTokenCount <= 0) {
      setIsCalculating(false);
      console.error("Invalid token count");
      return;
    }

    try {
      setIsCalculating(true);
      setHasCalcError(false);
      let cost;
      let canopyDepth = 0;
      let maxDepth = 0;
      let maxBufferSize = 0;

      if (formik.values.treeCreationMethod === TreeCreationMethod.CHEAPEST) {
        cost = await findCheapestTreeCost(creatorCount, totalTokenCount);
      } else if (
        formik.values.treeCreationMethod === TreeCreationMethod.TRADABLE
      ) {
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
    formik.values.treeCreationMethod,
    totalTokenCount,
  ]);

  const handleSolPayment = useCallback(
    async (amountInSol: number) => {
      if (!wallet || !airdropId) {
        console.error("Wallet or airdrop not found");
        return;
      }
      setIsSaving(true);
      const blueprint = createBlueprintClient({ cluster });

      try {
        const { txId } = await blueprint.payments.takePayment({
          wallet,
          mintAddress: SOL_MINT_ADDRESS,
          baseAmount: amountInSol * LAMPORTS_PER_SOL,
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

    const tokenCount = tokenData.tokens.reduce(
      (acc: number, token: Token) => acc + (Number(token?.amountToMint) || 0),
      0
    );

    console.log({ tokenCount });

    const { success } = await blueprint.collections.updateCollection({
      tokenImagesSizeInBytes: tokenData.tokens.reduce(
        (acc: number, token: Token) =>
          acc + (Number(token?.imageSizeInBytes) || 0),
        0
      ),
      tokenCount,
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
    formik.values.treeCreationMethod,
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
          <div className="sticky top-40 space-y-8">
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

            <div className="pt-8 mb-4 text-black text-2xl space-y-4">
              <div>select cost option:</div>
              <div className="flex max-w-sm mx-auto mb-8">
                <div className="flex flex-col space-y-4 text-lg text-gray-400">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="cheapest"
                      name="cheapest"
                      className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
                      checked={
                        formik.values.treeCreationMethod ===
                        TreeCreationMethod.CHEAPEST
                      }
                      onChange={() => {
                        formik.setFieldValue(
                          "treeCreationMethod",
                          TreeCreationMethod.CHEAPEST
                        );
                      }}
                    />
                    <label htmlFor="cheapest">
                      cheapest (not marketplace compatible)
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="tradable"
                      name="tradable"
                      className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
                      checked={
                        formik.values.treeCreationMethod ===
                        TreeCreationMethod.TRADABLE
                      }
                      onChange={() => {
                        formik.setFieldValue(
                          "treeCreationMethod",
                          TreeCreationMethod.TRADABLE
                        );
                      }}
                    />
                    <label htmlFor="tradable">
                      tradable (marketplace compatible)
                    </label>
                  </div>
                </div>
              </div>
              <div className="py-8 flex flex-col space-y-2">
                <div>final price:</div>
                <div className="flex items-center h-10">
                  {isCalculating ? (
                    <Spinner />
                  ) : (
                    <>{!!finalPrice && `${finalPrice} SOL`}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
