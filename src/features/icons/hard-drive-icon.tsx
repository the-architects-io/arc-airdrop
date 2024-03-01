import Lottie from "lottie-react";
import hardDrive from "@/features/icons/json/hard-drive.json";

export const HardDriveIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={hardDrive} loop={true} className={className} />;
};
