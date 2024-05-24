import { useSaving } from "@/app/blueprint/hooks/saving";
import { Token } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import Spinner from "@/features/UI/spinner";
import { TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Image from "next/image";

export const CnftCard = ({
  token,
  refetch,
}: {
  token: Token;
  refetch: () => void;
}) => {
  const { isSaving, setIsSaving } = useSaving();

  const handleRemoveToken = async (id: string | undefined) => {
    console.log({ id });
    if (!id) return;
    setIsSaving(true);
    try {
      if (token?.creators && token.creators.length > 0) {
        for (let creator of token.creators) {
          await axios.post(`${BASE_URL}/api/remove-creator`, {
            id: creator.id,
          });
        }
      }

      const res = await axios.post(`${BASE_URL}/api/remove-token`, { id });
    } catch (error) {
      console.error(error);
    } finally {
      refetch();
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-col mb-4" key={token.id}>
      <div className="mx-4 h-full min-h-full">
        <div className="shadow-deep rounded-md hover:rounded-md border border-gray-400 w-full flex flex-col flex-1 h-full min-h-full">
          <img
            src={token.image}
            alt={token.name}
            height={800}
            width={800}
            className="w-full rounded-t-md aspect-square object-cover"
          />
          <div className="flex flex-col flex-grow bg-gray-500 rounded-b-md">
            <div className="p-4 w-full space-y-2 flex-grow">
              <FormInputWithLabel
                className="text-gray-100 text-base line-clamp-1"
                label="name"
                name="name"
                placeholder="e.g. my nft"
                value={token.name}
                disabled
              />
              <FormTextareaWithLabel
                className="text-gray-100 text-base line-clamp-2"
                label="description"
                name="description"
                placeholder="e.g. my nft description"
                value={token.description}
                disabled
              />
              <FormInputWithLabel
                className="text-gray-100 text-base"
                label="link"
                name="link"
                placeholder="e.g. my nft"
                value={token.external_url}
                disabled
              />
            </div>
            <div className="flex w-full justify-between items-center p-4">
              <button className="rounded-full bg-gray-500 p-2" disabled>
                <TrashIcon className="w-8 h-8 text-gray-500" />
              </button>
              <div className="text-4xl text-cyan-400">
                {token.shouldFillRemaining ? "fill" : token.amountToMint}
              </div>
              <button
                className="rounded-full bg-cyan-400 hover:bg-cyan-500 p-2"
                onClick={() => handleRemoveToken(token.id)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="h-8 w-8 flex items-center justify-center text-gray-100">
                    <Spinner />
                  </div>
                ) : (
                  <TrashIcon className="w-8 h-8 text-gray-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
