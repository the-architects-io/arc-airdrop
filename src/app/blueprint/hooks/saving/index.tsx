"use client";
import {
  SavingContext,
  SavingContextType,
} from "@/app/blueprint/hooks/saving/provider";
import { useContext } from "react";

export const useSaving = (): SavingContextType => {
  const context = useContext(SavingContext);

  if (context === undefined) {
    throw new Error("useSaving must be used within a SavingProvider");
  }

  return context;
};
