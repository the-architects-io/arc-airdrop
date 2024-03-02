import { createBlueprintClient } from "@/app/blueprint/client";
import {
  useDebouncedFormikField,
  useDebouncedFormikNumericField,
} from "@/app/blueprint/hooks/formik-change-debounce";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { Collection, Creator } from "@/app/blueprint/types";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { useCluster } from "@/hooks/cluster";
import { debounce } from "@/utils/debounce";
import { useLazyQuery } from "@apollo/client";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";
import { useFormik } from "formik";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export const CreateCollectionStep = () => {
  const { publicKey } = useWallet();
  const { isSaving, setIsSaving } = useSaving();
  const [airdropId, setAirdropId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionImage, setCollectionImage] =
    useState<SingleImageUploadResponse | null>(null);
  const { cluster } = useCluster();
  const [existingCollectionImageUrl, setExistingCollectionImageUrl] = useState<
    string | null
  >(null);

  const [getCollection, { loading }] = useLazyQuery(GET_COLLECTION_BY_ID, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log({ data });
    },
  });

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      image: "",
      creatorWallet: publicKey?.toString() || "",
    },
    onSubmit: async ({
      collectionName,
      symbol,
      description,
      sellerFeeBasisPoints,
      creatorWallet,
    }) => {
      if (!publicKey || !collectionId || !creatorWallet?.length) {
        console.error("Missing required fields", {
          publicKey,
          collectionImage,
          collectionId,
          creatorWallet,
        });
        return;
      }

      if (isSaving) return;
      setIsSaving(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      let collection = {
        id: collectionId,
        name: collectionName,
        symbol,
        description,
        sellerFeeBasisPoints: sellerFeeBasisPoints * 100,
        isReadyToMint: true,
      } as Collection;

      if (collectionImage && collectionImage.sizeInBytes) {
        collection.imageSizeInBytes = collectionImage.sizeInBytes;
        collection.imageUrl = collectionImage.url;
      }

      const { data } = await getCollection({
        variables: { id: collectionId },
      });
      const { collections_by_pk: existingCollection } = data;

      if (
        existingCollection?.creators?.[0]?.wallet?.address !== creatorWallet
      ) {
        collection.creators = [
          { address: creatorWallet, share: 100, sortOrder: 0, id: 0 },
        ];
      }

      const { success } = await blueprint.collections.updateCollection(
        collection
      );

      setIsSaving(false);

      if (!success) {
        console.error("Failed to save collection");
        return;
      }
    },
  });

  const debouncedHandleChange = useDebouncedFormikField(
    formik,
    "collectionName"
  );

  useEffect(() => {
    if (!collectionId || !collectionImage) return;
    const blueprint = createBlueprintClient({
      cluster,
    });
    const updateCollection = async () => {
      const { success } = await blueprint.collections.updateCollection({
        id: collectionId,
        imageUrl: collectionImage.url,
      });
    };

    updateCollection();
  }, [cluster, collectionId, collectionImage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(() => {
      formik.submitForm();
    }, 500),
    []
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
    formik.values.creatorWallet,
  ]);

  useEffect(() => {
    const fetchCollection = async () => {
      const { data } = await getCollection({
        variables: { id: collectionId },
      });
      const { collections_by_pk: existingCollection } = data;
      if (existingCollection?.imageUrl) {
        setExistingCollectionImageUrl(existingCollection.imageUrl);
      }
      formik.setValues({
        collectionName: existingCollection?.name || "",
        symbol: existingCollection?.symbol || "",
        description: existingCollection?.description || "",
        sellerFeeBasisPoints: !!existingCollection?.sellerFeeBasisPoints
          ? existingCollection?.sellerFeeBasisPoints / 100
          : 0,
        creatorWallet:
          existingCollection?.creators?.[0]?.address ||
          publicKey?.toString() ||
          "",
        image: existingCollection?.imageUrl || "",
      });
    };

    if (collectionId) {
      fetchCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, getCollection, publicKey]);

  useEffect(() => {
    if (!window) return;

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
      <StepTitle>create on-chain collection</StepTitle>
      <StepSubtitle>this will represent your collection on-chain</StepSubtitle>
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
                fileName={`${collectionId}-collection.png`}
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
            <FormInputWithLabel
              label="creator wallet"
              name="creatorWallet"
              value={formik.values.creatorWallet}
              onChange={formik.handleChange}
              disabled={true}
              description="the wallet address of the collection creator"
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
    </>
  );
};
