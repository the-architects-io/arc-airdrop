import { createBlueprintClient } from "@/app/blueprint/client";
import { useSaving } from "@/app/blueprint/hooks/saving";
import { Collection } from "@/app/blueprint/types";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import {
  AirdropFlowStepName,
  useAirdropFlowStep,
} from "@/hooks/airdrop-flow-step/airdrop-flow-step";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { useUserData } from "@nhost/nextjs";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@the-architects/blueprint-graphql";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export const SelectCollectionStep = () => {
  const user = useUserData();
  const router = useRouter();
  const { cluster } = useCluster();
  const { setIsSaving } = useSaving();
  const { setStepIsValid } = useAirdropFlowStep();
  const [shouldUseExistingCollection, setShouldUseExistingCollection] =
    useState<boolean>(false);
  const [selectedExistingCollection, setSelectedExistingCollection] =
    useState<Collection | null>(null);
  const [airdropId, setAirdropId] = useState<string | null>(null);

  const { data: existingCollectionsData } = useQuery(
    GET_COLLECTIONS_BY_OWNER_ID,
    {
      variables: {
        id: user?.id,
      },
      skip: !user?.id,
      fetchPolicy: "no-cache",
    }
  );

  const formik = useFormik({
    initialValues: {
      selectedCollection: "",
    },
    onSubmit: async () => {
      const blueprint = createBlueprintClient({
        cluster,
      });
      let collectionId;
      if (
        (shouldUseExistingCollection && !selectedExistingCollection) ||
        !user?.id
      ) {
        return;
      }

      setIsSaving(true);

      if (!shouldUseExistingCollection) {
        try {
          const { collection } = await blueprint.collections.createCollection({
            ownerId: user.id,
          });
          collectionId = collection.id;
        } catch (e) {
          console.error(e);
          setIsSaving(false);
        }
      } else {
        collectionId = selectedExistingCollection?.id;
      }

      if (!collectionId) {
        console.error("collectionId is not defined");
        setIsSaving(false);
        return;
      }

      try {
        const { airdrop } = await blueprint.airdrops.createAirdrop({
          collectionId,
        });
        setAirdropId(airdrop.id);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    },
  });

  useEffect(() => {
    if (airdropId) {
      router.push(`/airdrop/select-recipients/${airdropId}`);
    }
  }, [airdropId, router]);

  if (!!airdropId) {
    return (
      <ContentWrapper>
        <ContentWrapperYAxisCenteredContent>
          <CheckBadgeIcon className="h-48 w-48 text-cyan-400" />
        </ContentWrapperYAxisCenteredContent>
      </ContentWrapper>
    );
  }

  return (
    <form>
      <StepTitle>select or create new collection</StepTitle>
      <StepSubtitle className="text-center">
        airdrop to an existing collection
      </StepSubtitle>
      <StepSubtitle className="text-center">
        or create a new collection on-chain
      </StepSubtitle>
      <div className="flex space-x-8">
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="checkbox"
            id="shouldCreateNewCollection"
            name="shouldCreateNewCollection"
            className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
            checked={!shouldUseExistingCollection}
            onChange={() => {
              setShouldUseExistingCollection(!shouldUseExistingCollection);
            }}
          />
          <label htmlFor="shouldCreateNewCollection">
            create new collection
          </label>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="checkbox"
            id="shouldUseExistingCollection"
            name="shouldUseExistingCollection"
            className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
            checked={shouldUseExistingCollection}
            onChange={() => {
              setShouldUseExistingCollection(!shouldUseExistingCollection);
            }}
          />
          <label htmlFor="shouldUseExistingTree">use existing collection</label>
        </div>
      </div>
      {shouldUseExistingCollection && (
        <div className="w-full flex justify-center">
          <div className="max-w-lg">
            <SelectInputWithLabel
              value={selectedExistingCollection?.id || ""}
              label="select collection"
              name="selectedCollection"
              options={[
                ...existingCollectionsData?.collections
                  ?.filter((c: Collection) => c.name?.length)
                  ?.map((c: Collection) => ({
                    label: c.name,
                    value: c.id,
                  })),
              ]}
              onChange={(e) => {
                const collection = existingCollectionsData?.collections.find(
                  (c: Collection) => c.id === e.target.value
                );
                setSelectedExistingCollection(collection);
              }}
              onBlur={() => {}}
              placeholder="select collection"
              hideLabel={false}
            />
          </div>
        </div>
      )}
      <div className="flex w-full justify-center mt-8">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          save
        </SubmitButton>
      </div>
    </form>
  );
};
