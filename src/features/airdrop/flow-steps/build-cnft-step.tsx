import { fadeOut } from "@/animations";
import { fadeOutTimeoutDuration } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { StepHeading } from "@/features/UI/typography/step-heading";
import { StepTitle } from "@/features/UI/typography/step-title";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";

export const BuildCnftsStep = () => {
  const router = useRouter();
  const { publicKey } = useWallet();
  const formik = useFormik({
    initialValues: {
      name: undefined,
      link: "",
      description: "",
      quantity: 1,
      addAnimation: "",
    },
    onSubmit: async ({ name }) => {},
  });

  const handeAddCnft = () => {
    fadeOut("#build-cnft-panel");
    setTimeout(() => {
      router.push("/airdrop/create-cnfts");
    }, fadeOutTimeoutDuration);
  };

  return (
    <>
      <StepTitle>cnft builder</StepTitle>
      <div className="flex flex-wrap w-full mb-28">
        <div className="w-full md:w-1/2 flex flex-col px-4">
          <div className="text-2xl mb-1">image</div>
          <div
            className="relative w-full bg-gray-400 rounded-md"
            style={{ paddingBottom: "100%" }}
          >
            <div className="absolute flex flex-col justify-center items-center text-gray-100 text-3xl p-2 transition-all hover:bg-cyan-400 cursor-pointer h-full w-full hover:rounded-md shadow-deep rounded-md">
              <PlusCircleIcon className="w-48 h-48" />
              <div className="text-3xl">add image</div>
            </div>
          </div>
          <div className="flex flex-col mt-8">
            <div className="space-y-5 w-full">
              <FormInputWithLabel
                type="number"
                label="quantity"
                name="qyantity"
                placeholder="e.g. 100"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                description="the number of cnfts to create"
              />
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
              name="link"
              placeholder="e.g. my nft"
              value={formik.values.link}
              onChange={formik.handleChange}
            />
            <FormInputWithLabel
              label="add animation"
              name="addAnimation"
              value={formik.values.addAnimation}
              onChange={formik.handleChange}
              disabled={true}
            />
            <StepHeading>traits</StepHeading>
            <div className="flex items-end space-x-2">
              <FormInputWithLabel
                label="name"
                name="name"
                value={""}
                onChange={() => {}}
              />
              <FormInputWithLabel
                label="value"
                name="value"
                value={""}
                onChange={() => {}}
              />
              <button>
                <PrimaryButton>
                  <PlusCircleIcon className="w-8 h-8" />
                </PrimaryButton>
              </button>
            </div>
          </form>
        </div>
        <div className="w-full flex justify-center mt-8">
          <PrimaryButton onClick={handeAddCnft}>done</PrimaryButton>
        </div>
      </div>
    </>
  );
};
