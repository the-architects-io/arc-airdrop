import Lottie from "lottie-react";
import dataCylinder from "@/features/icons/json/data-cylinder.json";

export const DataCylinderIcon = ({ className }: { className?: string }) => {
  return (
    <Lottie animationData={dataCylinder} loop={true} className={className} />
  );
};
