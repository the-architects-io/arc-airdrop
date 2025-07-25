import { v4 as uuidv4 } from "uuid";
import { fadeOut } from "@/animations";
import {
  Collection,
  MerkleTree,
  Token,
  TokenMetadata,
  Trait,
} from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  BASE_URL,
  fadeOutTimeoutDuration,
} from "@/constants/constants";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepHeading } from "@/features/UI/typography/step-heading";
import { StepTitle } from "@/features/UI/typography/step-title";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { useCluster } from "@/hooks/cluster";
import {
  InformationCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { DndCard } from "@/features/UI/cards/dnd-card";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import Link from "next/link";
import { GET_PREMINT_TOKENS_BY_COLLECTION_ID } from "@/graphql/queries/get-premint-tokens-by-collection-id";
import { useQuery } from "@apollo/client";
import { GET_COLLECTION_BY_ID } from "@the-architects/blueprint-graphql";

type SortedTrait = Trait & { sortOrder: number };

export const BuildCnftStep = () => {
  const router = useRouter();
  const user = useUserData();
  const { cluster } = useCluster();
  const [image, setImage] = useState<SingleImageUploadResponse | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const [airdropId, setAirdropId] = useState<string | undefined>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [hasFillerToken, setHasFillerToken] = useState(false);

  const { data: tokenData, refetch } = useQuery(
    GET_PREMINT_TOKENS_BY_COLLECTION_ID,
    {
      variables: {
        id: collectionId,
      },
      skip: !collectionId,
      fetchPolicy: "network-only",
    }
  );

  useQuery(GET_COLLECTION_BY_ID, {
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
      symbol: "",
      name: "",
      uri: "",
      description: "",
      traits: [] as SortedTrait[],
      saveAction: "mint",
      externalUrl: "",
      quantity: 1,
      shouldFillRemaining: false,
    },
    onSubmit: async ({
      name,
      description,
      symbol,
      saveAction,
      externalUrl,
    }) => {
      if (!user?.id || !image || !collection?.id) {
        console.error("Missing user or image");
        return;
      }

      const metadata: TokenMetadata = {
        name,
        symbol,
        description,
        seller_fee_basis_points: collection.sellerFeeBasisPoints,
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
            amountToMint: formik.values.quantity,
            shouldFillRemaining: formik.values.shouldFillRemaining,
            collectionId,
            imageSizeInBytes: image.sizeInBytes,
          },
        ],
      });

      if (!success) {
        console.error("Failed to create token");
        return;
      }

      fadeOut("#build-cnft-panel");
      setTimeout(() => {
        router.push("/airdrop/create-cnfts");
      }, fadeOutTimeoutDuration);
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

  useEffect(() => {
    if (!tokenId) {
      setTokenId(uuidv4());
    }

    if (!tokenData?.tokens) return;

    const hasFillerToken = tokenData.tokens.some(
      (token: Token) => token.shouldFillRemaining
    );

    setHasFillerToken(hasFillerToken);
  }, [tokenId, tokenData]);

  useEffect(() => {
    if (!window) return;

    if (airdropId && collectionId) {
      localStorage.setItem("airdropId", airdropId);
      localStorage.setItem("collectionId", collectionId);
    }
  }, [
    airdropId,
    collectionId,
    formik.values.name,
    formik.values.description,
    formik.values.traits,
    formik.values.saveAction,
    formik.values.externalUrl,
  ]);

  useEffect(() => {
    if (formik.values.shouldFillRemaining) {
      formik.setFieldValue("quantity", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.shouldFillRemaining]);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <FormikProvider value={formik}>
        <>
          <StepTitle>cnft builder</StepTitle>
          <div className="flex flex-wrap w-full mb-28">
            <div className="w-full md:w-1/2 flex flex-col px-4">
              <div className="text-2xl mb-1">image</div>
              <SingleImageUpload
                fileName={`${tokenId}`}
                driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                setImage={setImage}
              >
                <div
                  className="relative w-full bg-gray-400 rounded-md"
                  style={{ paddingBottom: "100%" }}
                >
                  <div className="absolute flex flex-col justify-center items-center text-gray-100 text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer h-full w-full hover:rounded-md shadow-deep rounded-md">
                    <PlusCircleIcon className="w-48 h-48" />
                    <div className="text-3xl">add image</div>
                  </div>
                </div>
              </SingleImageUpload>
              <div className="flex flex-col mt-8">
                <div className="space-y-5 w-full">
                  {!formik.values.shouldFillRemaining && (
                    <FormInputWithLabel
                      type="number"
                      label="quantity"
                      name="quantity"
                      placeholder="e.g. 100"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                      description="the number of cnfts to create"
                      disabled={formik.values.shouldFillRemaining}
                    />
                  )}
                  {!!hasFillerToken ? (
                    <div>
                      <div className="mb-2 text-2xl">fill remaining</div>
                      <div className="text-sm italic max-w-sm">
                        you have already added a token that will fill the
                        remaining quantity
                      </div>
                    </div>
                  ) : (
                    <div className="flex">
                      <FormCheckboxWithLabel
                        label="fill remaining"
                        name="shouldFillRemaining"
                        value={formik.values.shouldFillRemaining}
                        disabled={hasFillerToken}
                        onChange={(e: any) => {
                          formik.setFieldValue(
                            "shouldFillRemaining",
                            e.target.checked
                          );
                        }}
                      />
                      <InformationCircleIcon className="h-6 w-6 text-gray-400 mt-1 ml-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col px-4">
              <form className="space-y-4 w-full">
                <FormInputWithLabel
                  label="name"
                  name="name"
                  placeholder="e.g. my nft"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  description="the name of your cnft"
                />
                <FormTextareaWithLabel
                  className="text-2xl"
                  label="description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
                <FormInputWithLabel
                  label="link"
                  name="externalUrl"
                  placeholder="e.g. my nft"
                  value={formik.values.externalUrl}
                  onChange={formik.handleChange}
                  description="the url for your website, e.g. the-architects.io"
                />
                <div className="flex flex-col w-full pt-8">
                  <>
                    <StepHeading>traits</StepHeading>
                    <>
                      <FieldArray
                        name="traits"
                        render={(arrayHelpers) => (
                          <div className="w-full">
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
                                        label="name"
                                        name={`traits.${index}.name`}
                                        placeholder="e.g. Background, Eyes, Mouth"
                                        onChange={formik.handleChange}
                                        value={trait.name}
                                      />
                                    </div>
                                    <div className="w-48 mr-12">
                                      <FormInputWithLabel
                                        label="value"
                                        name={`traits.${index}.value`}
                                        placeholder="e.g. Red, Googly, Smiling"
                                        onChange={formik.handleChange}
                                        value={trait.value}
                                      />
                                    </div>
                                    {formik.values.traits.length > 0 && (
                                      <button
                                        className=" absolute right-0 bottom-1 cursor-pointer hover:text-cyan-400 transition-all duration-300"
                                        type="button"
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      >
                                        <XCircleIcon className="h-10 w-10" />
                                      </button>
                                    )}
                                  </div>
                                </DndCard>
                              ))}
                          </div>
                        )}
                      />
                      <SecondaryButton
                        className="text-gray-100 mt-4"
                        onClick={handleAddTrait}
                        disabled={
                          !(
                            formik.values.traits.every(
                              (t) => !!t.name && isUniqueName(t.name)
                            ) &&
                            formik.values.traits.every(
                              (t) => !!t.value && !!t.name
                            )
                          )
                        }
                      >
                        <PlusCircleIcon className="h-6 w-6 mr-4" />
                        add trait
                      </SecondaryButton>
                      <div className="mt-2 italic text-sm">
                        traits for your cnft, e.g. name: hat, value: sombrero
                      </div>
                    </>
                    <div className="w-full flex justify-center mt-16 space-x-8">
                      <Link href="/airdrop/create-cnfts">
                        <SecondaryButton
                          onClick={() => {
                            formik.resetForm();
                          }}
                        >
                          cancel
                        </SecondaryButton>
                      </Link>
                      <SubmitButton
                        isSubmitting={formik.isSubmitting}
                        onClick={() => {
                          formik.submitForm();
                        }}
                        disabled={
                          formik.isSubmitting ||
                          !formik.isValid ||
                          !image ||
                          !formik.values.name?.length ||
                          (Number(formik.values.quantity) < 1 &&
                            !formik.values.shouldFillRemaining)
                        }
                      >
                        done
                      </SubmitButton>
                    </div>
                  </>
                </div>
              </form>
            </div>
          </div>
        </>
      </FormikProvider>
    </DndProvider>
  );
};
