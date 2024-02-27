import { CostCollection } from "@/app/blueprint/types";

export const mapCosts = (costs: CostCollection[]) => {
  if (!costs) return null;

  return costs.map((cost) => {
    const { name, id, dispenserId } = cost;
    const {
      item,
      name: itemCollectionName,
      imageUrl: itemCollectionImageUrl,
      amount,
    } = cost.itemCollection;
    const { token } = item;
    return {
      name: name || itemCollectionName,
      amount,
      id,
      imageUrl: item?.imageUrl || itemCollectionImageUrl,
      dispenserId,
      token: {
        id: token.id,
        mintAddress: token.mintAddress,
        name: token.name,
      },
    };
  });
};
