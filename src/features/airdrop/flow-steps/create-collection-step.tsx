import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepSubtitle } from "@/features/UI/typography/step-subtitle";
import { StepTitle } from "@/features/UI/typography/step-title";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useState } from "react";

export const CreateCollectionStep = () => {
  const { publicKey } = useWallet();
  const [airdropId, setAirdropId] = useState<string>(
    "3bc510ff-f095-4a0d-9d3a-e7c5e77160bb"
  );
  const [collectionId, setCollectionId] = useState<string>(
    "6d93bba7-5947-42bf-95da-7a9f2184acd9"
  );
  const [collectionImage, setCollectionImage] =
    useState<SingleImageUploadResponse | null>(null);

  const formik = useFormik({
    initialValues: {
      collectionName: undefined,
      symbol: "",
      sellerFeeBasisPoints: "",
      description: "",
      creatorWallet: publicKey?.toString() || "",
    },
    onSubmit: async ({ collectionName, symbol }) => {},
  });

  return (
    <>
      <StepTitle>create on-chain collection</StepTitle>
      <StepSubtitle>this will represent your collection on-chain</StepSubtitle>
      <div className="flex flex-wrap w-full mb-28">
        <div className="w-full md:w-1/2 flex flex-col px-4">
          <SingleImageUpload
            fileName={`${collectionId}-collection.png`}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            setImage={setCollectionImage}
          >
            <div className="text-2xl mb-1">collection image</div>
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
