import { RewardDisplayTypes } from "@/app/blueprint/types";

export const defaultCustomizations = {
  backgroundColor: "#2d2d2d",
  textColor: "#b6b6b6",
  claimButtonColor: "#7dd3fc",
  claimButtonTextColor: "#000000",
  shouldDisplayRewards: true,
  rewardDisplayType: RewardDisplayTypes.LIST,
  shouldDisplayName: true,
  shouldDisplayDescription: true,
  shouldDisplayImage: true,
  imageSize: 120,
  nameTextSize: 36,
  descriptionTextSize: 16,
  claimButtonTextSize: 16,
  isDirty: false,
  claimButtonText: "Claim",
};
