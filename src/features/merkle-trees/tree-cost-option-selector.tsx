import { TreeCreationMethod } from "@/app/blueprint/types";
import Spinner from "@/features/UI/spinner";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export const TreeCostOptionSelector = ({
  treeCreationMethod,
  setTreeCreationMethod,
  isCalculating,
  setIsCalculating,
  finalPrice,
  setFinalPrice,
}: {
  treeCreationMethod: TreeCreationMethod;
  setTreeCreationMethod: (treeCreationMethod: TreeCreationMethod) => void;
  isCalculating: boolean;
  setIsCalculating: (isCalculating: boolean) => void;
  finalPrice: number | null;
  setFinalPrice: (finalPrice: number | null) => void;
}) => {
  const treeCreationMethodOptions = [
    {
      value: TreeCreationMethod.CHEAPEST,
      label: "Cheapest",
    },
    {
      value: TreeCreationMethod.TRADABLE,
      label: "Trading Platform Friendly",
    },
  ];

  const formik = useFormik({
    initialValues: {
      treeCreationMethod: TreeCreationMethod.CHEAPEST,
    },
    onSubmit: async (values) => {},
  });

  useEffect(() => {
    setTreeCreationMethod(formik.values.treeCreationMethod);
  }, [formik.values.treeCreationMethod, setTreeCreationMethod]);

  return (
    <div className="pt-8 mb-4 text-black text-2xl space-y-4">
      <div>select cost option:</div>
      <div className="flex max-w-sm mx-auto mb-8">
        <div className="flex flex-col space-y-4 text-lg text-gray-400">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="cheapest"
              name="cheapest"
              className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
              checked={
                formik.values.treeCreationMethod === TreeCreationMethod.CHEAPEST
              }
              onChange={() => {
                formik.setFieldValue(
                  "treeCreationMethod",
                  TreeCreationMethod.CHEAPEST
                );
              }}
            />
            <label htmlFor="cheapest">
              cheapest (not marketplace compatible)
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="tradable"
              name="tradable"
              className="w-12 h-12 rounded-md active:ring-2 active:ring-cyan-400"
              checked={
                formik.values.treeCreationMethod === TreeCreationMethod.TRADABLE
              }
              onChange={() => {
                formik.setFieldValue(
                  "treeCreationMethod",
                  TreeCreationMethod.TRADABLE
                );
              }}
            />
            <label htmlFor="tradable">tradable (marketplace compatible)</label>
          </div>
        </div>
      </div>
      <div className="py-8 flex flex-col space-y-2">
        <div>final price:</div>
        <div className="flex items-center h-10">
          {isCalculating ? (
            <Spinner />
          ) : (
            <>{!!finalPrice && `${finalPrice} SOL`}</>
          )}
        </div>
      </div>
    </div>
  );
};
