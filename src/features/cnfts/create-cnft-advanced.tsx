"use client";

import { v4 as uuidv4 } from "uuid";
import { FieldArray, FormikProvider, move, useFormik } from "formik";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
} from "@/utils/formatting";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { GET_MERKLE_TREES_BY_USER_ID } from "@the-architects/blueprint-graphql";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { MerkleTree, TokenMetadata, Trait } from "@/app/blueprint/types";
import { useCallback, useEffect, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import showToast from "@/features/toasts/show-toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { useUserData } from "@nhost/nextjs";
import { DndCard } from "@/features/UI/cards/dnd-card";

enum SAVE_ACTIONS {
  MINT = "mint",
  PREMINT = "premint",
}

type SortedTrait = Trait & { sortOrder: number };

export const CreateCnftAdvanced = ({
  collectionId,
  onCompleted,
}: {
  collectionId?: string;
  onCompleted?: () => void;
}) => {
  const user = useUserData();
  const { cluster } = useCluster();
  const [availableMerkleTrees, setAvailableMerkleTrees] = useState<
    (MerkleTree & { label: string; value: string })[]
  >([]);
  const [image, setImage] = useState<SingleImageUploadResponse | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const { data } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: SYSTEM_USER_ID,
    },
  });

  useEffect(() => {
    if (data?.merkleTrees) {
      setAvailableMerkleTrees(
        data.merkleTrees
          .filter((tree: MerkleTree) => tree.cluster === cluster)
          .map((tree: MerkleTree) => ({
            ...tree,
            label: `${getAbbreviatedAddress(tree.address)} - ${
              formatNumberWithCommas(tree.maxCapacity) ?? 0
            } Max capacity`,
            value: tree.address,
          }))
      );
    }
  }, [cluster, data]);

  useEffect(() => {
    if (!tokenId) {
      setTokenId(uuidv4());
    }
  }, [tokenId]);

  useEffect(() => {
    if (image) {
      console.log("image", image);
    }
  }, [image]);

  const formik = useFormik({
    initialValues: {
      sellerFeeBasisPoints: 0,
      symbol: "",
      name: "",
      uri: "",
      description: "",
      traits: [] as SortedTrait[],
      saveAction: "mint",
      externalUrl: "",
    },
    onSubmit: async ({
      sellerFeeBasisPoints,
      name,
      description,
      symbol,
      saveAction,
      externalUrl,
    }) => {
      if (saveAction === SAVE_ACTIONS.MINT) {
        showToast({
          primaryMessage: "Not implemented",
        });
        return;
      }

      if (!user?.id || !image) {
        showToast({
          primaryMessage: "Missing user or image",
        });
        return;
      }

      const metadata: TokenMetadata = {
        name,
        symbol,
        description,
        seller_fee_basis_points: sellerFeeBasisPoints * 100,
        external_url: externalUrl,
        image: image.url,
        attributes: formik.values.traits.map((trait) => ({
          trait_type: trait.name,
          value: trait.value,
        })),
      };

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { success, tokens } = await blueprint.tokens.createTokens({
        tokens: [
          {
            ...metadata,
            userId: user?.id,
            isPremint: true,
            collectionId,
            imageSizeInBytes: image.sizeInBytes,
          },
        ],
      });

      onCompleted?.();
    },
  });

  const moveTraitCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      formik.setFieldValue(
        "traits",
        formik.values.traits.map((trait, index) => {
          if (index === dragIndex) {
            return { ...trait, sortOrder: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...trait, sortOrder: dragIndex };
          }
          return trait;
        })
      );
    },
    [formik]
  );

  const handleAddTrait = useCallback(() => {
    formik.setFieldValue("traits", [
      ...formik.values.traits,
      {
        name: "",
        value: "",
        sortOrder: formik.values.traits.length,
        id: formik.values.traits.length,
      },
    ]);
  }, [formik]);

  const isUniqueName = (name: string) =>
    formik.values.traits.filter((trait) => trait.name === name).length === 1;

  return (
    <div className="flex flex-col items-center w-full">
      <DndProvider backend={HTML5Backend}>
        <FormikProvider value={formik}>
          <>
            <div className="max-w-md mx-auto">
              <SingleImageUpload
                fileName={`${tokenId}`}
                driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                setImage={setImage}
              >
                Add cNFT Image
              </SingleImageUpload>
            </div>
          </>
          <div className="flex flex-wrap w-full">
            <div className="flex flex-col w-full md:w-1/2 px-4 space-y-4">
              <FormInputWithLabel
                label="Name"
                name="name"
                placeholder="Name"
                onChange={formik.handleChange}
                value={formik.values.name}
              />
              <FormInputWithLabel
                label="Link"
                name="externalUrl"
                placeholder="Link to include in cNFT"
                onChange={formik.handleChange}
                value={formik.values.externalUrl}
              />
              <FormTextareaWithLabel
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </div>
            <div className="flex flex-col w-full md:w-1/2 px-4 pt-8">
              <>
                <div className="text-lg text-center pt-8">Traits</div>
                <>
                  <FieldArray
                    name="traits"
                    render={(arrayHelpers) => (
                      <div className="bg-black w-full">
                        {formik.values.traits
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((trait, index) => (
                            <DndCard
                              className="mb-4"
                              key={trait.id}
                              id={trait.id}
                              index={index}
                              moveCard={moveTraitCard}
                            >
                              <div className="relative w-full flex">
                                <div className="flex flex-1 mr-4">
                                  <FormInputWithLabel
                                    label="Name"
                                    name={`traits.${index}.name`}
                                    placeholder="e.g. Background, Eyes, Mouth"
                                    onChange={formik.handleChange}
                                    value={trait.name}
                                  />
                                </div>
                                <div className="w-48 mr-8">
                                  <FormInputWithLabel
                                    label="Value"
                                    name={`traits.${index}.value`}
                                    placeholder="e.g. Red, Googly, Smiling"
                                    onChange={formik.handleChange}
                                    value={trait.value}
                                  />
                                </div>
                                {formik.values.traits.length > 0 && (
                                  <button
                                    className=" absolute -top-2 -right-2.5 cursor-pointer"
                                    type="button"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    <XMarkIcon className="h-6 w-6 text-gray-100" />
                                  </button>
                                )}
                              </div>
                            </DndCard>
                          ))}
                      </div>
                    )}
                  />
                  <PrimaryButton
                    className="text-gray-100 mt-4"
                    onClick={handleAddTrait}
                    disabled={
                      !(
                        formik.values.traits.every(
                          (t) => !!t.name && isUniqueName(t.name)
                        ) &&
                        formik.values.traits.every((t) => !!t.value && !!t.name)
                      )
                    }
                  >
                    <PlusIcon className="h-6 w-6" />
                    Add Trait
                  </PrimaryButton>
                </>
              </>
            </div>
          </div>
          <div className="pt-4 w-full flex justify-center my-8">
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              onClick={() => {
                formik.setFieldValue("saveAction", "premint");
                formik.submitForm();
              }}
              disabled={formik.isSubmitting || !formik.isValid}
            >
              Save cNFT
            </SubmitButton>
          </div>
        </FormikProvider>
      </DndProvider>
    </div>
  );
};
