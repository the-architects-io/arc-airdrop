"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SavingContextType {
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
}

export const SavingContext = createContext<SavingContextType | undefined>(
  undefined
);

export interface SavingProviderProps {
  children: ReactNode;
}

export const SavingProvider: React.FC<SavingProviderProps> = ({ children }) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  return (
    <SavingContext.Provider value={{ isSaving, setIsSaving }}>
      {children}
    </SavingContext.Provider>
  );
};
