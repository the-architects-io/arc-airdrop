import { Dispenser, DispenserGate } from "@/app/blueprint/types";
import { mapTraitBasedCollection } from "@/app/blueprint/utils/mappers/trait-collection";

export const mapGates = (
  gates: Dispenser["gateCollections"]
): DispenserGate[] | null => {
  if (!gates) return null;

  return mapTraitBasedCollection(gates);
};
