import { fadeInDuration, fadeOutDuration } from "@/constants/constants";
import { animate } from "motion";

type AnimationOptions = {
  delay?: number;
  duration?: number;
};

export const fadeIn = (elementSelector: string, options?: AnimationOptions) => {
  animate(
    elementSelector,
    { opacity: [0, 1] },
    { duration: fadeInDuration, ...options }
  );
};

export const fadeOut = (
  elementSelector: string,
  options?: AnimationOptions
) => {
  animate(
    elementSelector,
    { opacity: [1, 0] },
    { duration: fadeOutDuration, ...options }
  );
};
