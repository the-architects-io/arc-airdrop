"use client";

import { Airdrop } from "@/app/blueprint/types";
import { ARCHITECTS_WS_API_URL } from "@/constants/constants";
import { useQuery } from "@apollo/client";
import { GET_AIRDROP_BY_ID } from "@the-architects/blueprint-graphql";
import React, { ReactNode, useContext, useEffect, useState } from "react";

type AirdropStatsContext = {
  airdrop: Airdrop | null;
  setAirdrop: (airdrop: Airdrop) => void;
};

const AirdropStatsContext = React.createContext({} as AirdropStatsContext);
const { Provider } = AirdropStatsContext;

export const AirdropStatsProvider = ({ children }: { children: ReactNode }) => {
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);

  return (
    <Provider
      value={{
        airdrop,
        setAirdrop,
      }}
    >
      {children}
    </Provider>
  );
};

export const useAirdropStats = (airdropId: string) => {
  const { airdrop, setAirdrop } = useContext(AirdropStatsContext);

  const { data, refetch } = useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: airdropId,
    },
    skip: !airdropId,
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      setAirdrop(data.airdrop);
    },
  });

  return {
    airdrop,
    setAirdrop,
    refetch,
  };
};
