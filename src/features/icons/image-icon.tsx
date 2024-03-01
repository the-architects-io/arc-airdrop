import Lottie from "lottie-react";
import image from "@/features/icons/json/image.json";

export const ImageIcon = ({ className }: { className?: string }) => {
  return <Lottie animationData={image} loop={true} className={className} />;
};
