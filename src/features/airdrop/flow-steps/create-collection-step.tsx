import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import Image from "next/image";
import { useState } from "react";

export const CreateCollectionStep = () => {
  const formik = useFormik({
    initialValues: {
      collectionName: undefined,
      symbol: "",
      sellerFeeBasisPoints: "",
      description: "",
    },
    onSubmit: async ({ collectionName, symbol }) => {},
  });

  return (
    <>
      <div className="text-3xl mb-4 font-heavy">create on-chain collection</div>
      <div className="mb-8">this will represent your collection on-chain</div>
      <div className="flex flex-wrap w-full mb-28">
        <div className="w-full md:w-1/2 flex flex-col px-4">
          <div className="text-2xl mb-1">collection image</div>
          <div
            className="relative w-full bg-gray-400 rounded-md"
            style={{ paddingBottom: "100%" }}
          >
            <div className="absolute flex flex-col justify-center items-center text-gray-100 text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer h-full w-full hover:rounded-md">
              <PlusCircleIcon className="w-48 h-48" />
              <div className="text-3xl">add image</div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col px-4">
          <form className="space-y-4 w-full">
            <FormInputWithLabel
              label="collection name"
              name="collectionName"
              placeholder="e.g. my collection"
              value={formik.values.collectionName}
              onChange={formik.handleChange}
              description="this will be the name of your collection on-chain"
            />
            <FormInputWithLabel
              label="symbol"
              name="symbol"
              value={formik.values.symbol}
              onChange={formik.handleChange}
              description="this will be the symbol of your collection on-chain"
            />
            <div className="flex relative">
              <FormInputWithLabel
                label="royalty"
                name="sellerFeeBasisPoints"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 5%"
                onChange={(e) => {
                  formik.handleChange(e);
                  if (Number(e.target.value) > 100) {
                    formik.setFieldValue("sellerFeeBasisPoints", 100);
                  }
                }}
                value={formik.values.sellerFeeBasisPoints}
              />
              <div className="text-3xl text-gray-100 bottom-1 right-8 absolute mb-0.5">
                %
              </div>
            </div>
            <FormTextareaWithLabel
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
