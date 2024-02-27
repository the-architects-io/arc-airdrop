import {
  DispenserGate,
  DispenserRestriction,
  TraitBasedCollection,
} from "@/app/blueprint/types";

export const mapTraitBasedCollection = (
  traitBasedCollection: TraitBasedCollection[]
): DispenserGate[] | DispenserRestriction[] => {
  return traitBasedCollection.map(({ id, traitCollection }) => {
    return {
      id,
      trait: { ...traitCollection.trait, value: traitCollection.value },
    };
  });
};
