"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Collection } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";
import { useUserData } from "@nhost/nextjs";
import { useState } from "react";

export const CreateCollectionButton = ({
  name,
  ownerId,
  onSuccess,
  cluster = "devnet",
}: {
  name: string;
  ownerId?: string;
  onSuccess?: (collection: Collection) => void;
  cluster?: "devnet" | "mainnet-beta";
}) => {
  const [isCreatingCollection, setIsCreatingCollection] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserData();
  const handleCreateCollection = async () => {
    setIsLoading(true);
    const blueprint = createBlueprintClient({ cluster });
    setIsCreatingCollection(true);

    const { collection, success } =
      await blueprint.collections.createCollection({
        name,
        hasBeenMinted: false,
        ownerId: !!user?.id ? user?.id : ownerId,
      });

    if (success) {
      onSuccess && onSuccess(collection);
    }
    setIsLoading(false);
  };

  return (
    <PrimaryButton onClick={handleCreateCollection}>
      {isLoading || isCreatingCollection ? <Spinner /> : "Create Collection"}
    </PrimaryButton>
  );
};
