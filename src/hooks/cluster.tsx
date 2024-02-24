"use client";

import React, { ReactNode, useContext, useState } from "react";

type ClusterContext = {
  cluster: "devnet" | "mainnet-beta";
  setCluster: (cluster: "devnet" | "mainnet-beta") => void;
};

const ClusterContext = React.createContext({} as ClusterContext);
const { Provider } = ClusterContext;

export const ClusterProvider = ({ children }: { children: ReactNode }) => {
  const [cluster, setCluster] = useState<"devnet" | "mainnet-beta">("devnet");

  return (
    <Provider
      value={{
        cluster,
        setCluster,
      }}
    >
      {children}
    </Provider>
  );
};

export const useCluster = () => {
  const { cluster, setCluster } = useContext(ClusterContext);

  return { cluster, setCluster };
};
