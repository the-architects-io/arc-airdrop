import { createBlueprintClient } from "@/app/blueprint/client";
import {
  useDebouncedFormikField,
  useDebouncedFormikNumericField,
} from "@/app/blueprint/hooks/formik-change-debounce";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { Airdrop, Collection, Creator } from "@/app/blueprint/types";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { DndCard } from "@/features/UI/cards/dnd-card";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useCluster } from "@/hooks/cluster";
import { useLogs } from "@/hooks/logs";
import { debounce } from "@/utils/debounce";
import { isValidPublicKey } from "@/utils/rpc";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  CheckBadgeIcon,
  PlusCircleIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  GET_COLLECTIONS_BY_OWNER_ID,
  GET_COLLECTION_BY_ID,
} from "@the-architects/blueprint-graphql";
import axios from "axios";
import { FieldArray, FormikProvider, useFormik } from "formik";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const CreateCollectionStep = ({ airdrop }: { airdrop: Airdrop }) => {
  const user = useUserData();
  const { publicKey } = useWallet();
  const { setStepIsValid } = useAirdropFlowStep();
  const { isSaving, setIsSaving } = useSaving();
  const [collectionImage, setCollectionImage] =
    useState<SingleImageUploadResponse | null>(null);
  const { cluster } = useCluster();
  const [existingCollectionImageUrl, setExistingCollectionImageUrl] = useState<
    string | null
  >(null);
  const [collectionImageSizeInBytes, setCollectionImageSizeInBytes] =
    useState<number>(0);
  const [collectionImageUrl, setCollectionImageUrl] = useState<string | null>(
    null
  );
  const [creators, setCreators] = useState<Creator[] | null>(null);

  const { logs, addLog } = useLogs();

  const [getCollection, { loading }] = useLazyQuery(GET_COLLECTION_BY_ID, {
    fetchPolicy: "network-only",
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      setCreators(collection?.creators);
      console.log(collection);
    },
  });

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      image: "",
      creators: [{ address: "", share: 0, sortOrder: 0, id: 0 }] as Creator[],
    },
    onSubmit: async ({
      collectionName,
      symbol,
      description,
      sellerFeeBasisPoints,
      creators,
    }) => {
      if (!publicKey || !airdrop?.collection?.id || !creators?.[0]?.address) {
        console.error("Missing required fields", {
          publicKey,
          collectionImage,
          collectionId: airdrop?.collection?.id,
        });
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { data } = await getCollection({
        variables: { id: airdrop.collection.id },
      });

      const { collections_by_pk: existingCollection } = data;

      const cleanedCreators = creators
        .map((creator) => ({
          address: creator.address,
          share: creator.share,
          sortOrder: creator.sortOrder,
        }))
        // remove duplicates
        .filter(
          (creator, index, self) =>
            index === self.findIndex((c) => c.address === creator.address)
        )
        // remove empty creators
        .filter(
          (creator) =>
            creator.address?.length && isValidPublicKey(creator.address)
        )
        // replace creators in existing collection
        .map((creator) => {
          const existingCreator = existingCollection?.creators.find(
            (c: Creator) => c.address === creator.address
          );
          if (existingCreator) {
            return {
              id: existingCreator.id,
              address: creator.address,
              share: creator.share,
              sortOrder: creator.sortOrder,
            };
          }
          return creator;
        });

      let collection = {
        id: airdrop.collection.id,
        name: collectionName,
        symbol,
        description,
        sellerFeeBasisPoints: sellerFeeBasisPoints * 100,
        isReadyToMint: true,
        creators: cleanedCreators,
      } as Collection;

      if (collectionImage) {
        collection.imageSizeInBytes = collectionImageSizeInBytes;
      }
      if (collectionImageUrl) {
        collection.imageUrl = collectionImageUrl;
      }

      const { success } = await blueprint.collections.updateCollection(
        collection
      );

      setIsSaving(false);

      if (!success) {
        addLog("Failed to save collection");
        return;
      }

      addLog("Collection updated successfully");
    },
  });

  useEffect(() => {
    if (creators?.length && formik.values.creators.length === 0) {
      formik.setFieldValue(
        "creators",
        creators.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
    }
  }, [creators, formik, formik.values.creators.length]);

  useEffect(() => {
    if (!airdrop?.collection?.id || !collectionImage) return;
    const blueprint = createBlueprintClient({
      cluster,
    });
    const updateCollection = async () => {
      const { success } = await blueprint.collections.updateCollection({
        id: airdrop.collection.id,
        imageUrl: collectionImage.url,
      });
    };

    updateCollection();
  }, [cluster, airdrop?.collection?.id, collectionImage]);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      formik.setFieldValue(
        "creators",
        formik.values.creators.map((creator, index) => {
          if (index === dragIndex) {
            return { ...creator, sortOrder: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...creator, sortOrder: dragIndex };
          }
          return creator;
        })
      );
    },
    [formik]
  );

  const handleAddCreator = useCallback(() => {
    debugger;
    formik.setFieldValue("creators", [
      ...formik.values.creators,
      {
        address: "",
        share: 0,
        sortOrder: formik.values.creators.length,
        id: formik.values.creators.length,
      },
    ]);
  }, [formik]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(() => {
      formik.submitForm();
    }, 500),
    []
  );

  const handleRemoveCreator = useCallback(
    async (index: string | number) => {
      formik.setFieldValue(
        "creators",
        formik.values.creators.filter((_, i) => i !== index)
      );

      if (typeof index !== "number") return;

      const { data } = await axios.post("/api/remove-creator", {
        id: formik.values.creators[index].id,
      });
    },
    [formik]
  );

  useEffect(() => {
    debouncedSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.collectionName,
    formik.values.symbol,
    formik.values.description,
    formik.values.sellerFeeBasisPoints,
    formik.values.image,
    formik.values.creators,
  ]);

  useEffect(() => {
    const fetchCollection = async () => {
      const { data } = await getCollection({
        variables: { id: airdrop.collection.id },
      });
      const { collections_by_pk: existingCollection } = data;
      if (existingCollection?.imageUrl) {
        setExistingCollectionImageUrl(existingCollection.imageUrl);
      }

      const { creators } = existingCollection;
      console.log({ creators });

      formik.setValues({
        collectionName: existingCollection?.name || "",
        symbol: existingCollection?.symbol || "",
        description: existingCollection?.description || "",
        sellerFeeBasisPoints: !!existingCollection?.sellerFeeBasisPoints
          ? existingCollection?.sellerFeeBasisPoints / 100
          : 0,
        image: existingCollection?.imageUrl || "",
        creators: creators?.length
          ? creators.map((creator: Collection["creators"][0]) => ({
              address: creator?.wallet?.address,
              share: creator.share,
              sortOrder: creator.sortOrder,
              id: creator.id,
            }))
          : ([{ address: "", share: 100, sortOrder: 0, id: 0 }] as Creator[]),
      });
    };

    if (airdrop?.collection?.id) {
      fetchCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airdrop?.collection?.id, getCollection, publicKey]);

  useEffect(() => {
    setStepIsValid(
      AirdropFlowStepName.CreateCollection,
      !!formik.values.collectionName &&
        !!formik.values.creators?.[0]?.address &&
        // shares add up to 100
        formik.values.creators.reduce(
          (acc, creator) => acc + creator.share,
          0
        ) === 100 &&
        !isSaving &&
        !loading &&
        !!airdrop.collection.id &&
        (!!collectionImage || !!existingCollectionImageUrl) &&
        formik.values.sellerFeeBasisPoints >= 0 &&
        formik.values.sellerFeeBasisPoints <= 100
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.collectionName,
    formik.values.symbol,
    formik.values.sellerFeeBasisPoints,
    isSaving,
    loading,
    airdrop?.collection?.id,
    collectionImage,
    existingCollectionImageUrl,
  ]);

  useEffect(() => {
    if (!airdrop?.collection?.id || !collectionImage) return;

    const blueprint = createBlueprintClient({
      cluster,
    });
    setCollectionImageSizeInBytes(collectionImage.sizeInBytes ?? 0);
    setCollectionImageUrl(collectionImage.url);
    console.log({
      collectionImage,
      sizeinbytes: collectionImage.sizeInBytes,
      url: collectionImage.url,
    });
    blueprint.collections.updateCollection({
      id: airdrop.collection.id,
      imageUrl: collectionImage.url,
      imageSizeInBytes: collectionImage.sizeInBytes,
    });
  }, [cluster, airdrop?.collection?.id, collectionImage]);

  return (
    <DndProvider backend={HTML5Backend}>
      <FormikProvider value={formik}>
        <StepTitle>create on-chain collection</StepTitle>
        <StepSubtitle>
          this will represent your collection on-chain
        </StepSubtitle>

        <div className="flex flex-wrap w-full mb-28">
          <div className="w-full md:w-1/2 flex flex-col px-4">
            {existingCollectionImageUrl ? (
              <>
                <div className="text-2xl mb-1 text-left">collection image</div>
                <Image
                  src={existingCollectionImageUrl}
                  alt="collection image"
                  className="rounded-md shadow-deep"
                  width={1200}
                  height={1200}
                />
              </>
            ) : (
              <>
                <div className="text-2xl mb-1 text-left mx-5">
                  collection image
                </div>
                <SingleImageUpload
                  fileName={`${airdrop?.collection?.id}-collection.png`}
                  driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                  setImage={setCollectionImage}
                >
                  <div
                    className="relative w-full bg-gray-400 rounded-md shadow-deep"
                    style={{ paddingBottom: "100%" }}
                  >
                    <div className="absolute flex flex-col justify-center items-center text-gray-100 text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer h-full w-full hover:rounded-md">
                      <PlusCircleIcon className="w-48 h-48" />
                      <div className="text-3xl">add image</div>
                    </div>
                  </div>
                </SingleImageUpload>
              </>
            )}
          </div>
          <div className="w-full md:w-1/2 flex flex-col px-4">
            <form className="space-y-4 w-full">
              <FormInputWithLabel
                label="collection name"
                name="collectionName"
                placeholder="e.g. my collection"
                value={formik.values.collectionName}
                onChange={formik.handleChange}
                description="the name of your collection on-chain"
              />
              <FormInputWithLabel
                label="symbol"
                name="symbol"
                value={formik.values.symbol}
                onChange={formik.handleChange}
                description="the symbol of your collection on-chain"
              />
              <div className="flex relative">
                <FormInputWithLabel
                  label="royalty"
                  name="sellerFeeBasisPoints"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 5%"
                  description="the royalties received by creator(s) on secondary sales"
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (Number(e.target.value) > 100) {
                      formik.setFieldValue("sellerFeeBasisPoints", 100);
                    }
                  }}
                  value={formik.values.sellerFeeBasisPoints}
                />
                <div className="text-3xl text-gray-100 top-10 right-8 absolute mt-0.5">
                  %
                </div>
              </div>
              <>
                <FieldArray
                  name="creators"
                  render={(arrayHelpers) => (
                    <div className="w-full">
                      {formik.values.creators
                        .sort((a, b) => {
                          if (!a.sortOrder || !b.sortOrder) return -1;
                          return a.sortOrder - b.sortOrder;
                        })
                        .map((creator, index) => (
                          <DndCard
                            className="mb-4"
                            key={creator.id}
                            id={creator.id}
                            index={index}
                            moveCard={moveCard}
                          >
                            <div className="relative w-full flex">
                              <div className="flex flex-1 mr-4">
                                <FormInputWithLabel
                                  label="creator address"
                                  name={`creators.${index}.address`}
                                  placeholder="creator address"
                                  onChange={formik.handleChange}
                                  value={creator.address}
                                />
                                {isValidPublicKey(creator.address) ? (
                                  <CheckBadgeIcon className="h-6 w-6 text-green-500 self-end ml-2 mb-3" />
                                ) : (
                                  <XCircleIcon className="h-6 w-6 text-red-500 self-end ml-2 mb-3" />
                                )}
                              </div>
                              <div className="w-32 relative">
                                <FormInputWithLabel
                                  label="share"
                                  name={`creators.${index}.share`}
                                  placeholder="Share"
                                  type="number"
                                  min={0}
                                  max={100}
                                  onChange={formik.handleChange}
                                  value={creator.share}
                                />
                                <div className="text-3xl text-gray-100 top-10 right-8 absolute mt-0.5">
                                  %
                                </div>
                              </div>
                              {formik.values.creators.length > 1 && (
                                <button
                                  className=" absolute -top-2 -right-2.5 cursor-pointer border border-cyan-400 rounded-full p-1 transition-all"
                                  type="button"
                                  onClick={async () => {
                                    handleRemoveCreator(index);
                                    // arrayHelpers.remove(index);
                                  }}
                                >
                                  <XMarkIcon className="h-6 w-6 text-cyan-400" />
                                </button>
                              )}
                            </div>
                          </DndCard>
                        ))}
                    </div>
                  )}
                />
                <SecondaryButton
                  className="mt-4 w-full"
                  onClick={handleAddCreator}
                  disabled={
                    !(
                      formik.values.creators.every(
                        (c) => !!c.address && isValidPublicKey(c.address)
                      ) && formik.values.creators.every((c) => c.share)
                    )
                  }
                >
                  <PlusIcon className="h-6 w-6" />
                  Add Creator
                </SecondaryButton>
                <p className="text-sm text-gray-400 mt-2 italic">
                  the creators receive the royalties on secondary sales
                </p>
              </>
              <FormTextareaWithLabel
                className="text-2xl"
                label="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </form>
          </div>
        </div>
      </FormikProvider>
    </DndProvider>
  );
};
