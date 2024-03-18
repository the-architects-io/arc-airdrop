"use client";

import React, { ReactNode, useContext, useEffect, useState } from "react";

type ClusterContext = {
  cluster: "devnet" | "mainnet-beta";
  setCluster: (cluster: "devnet" | "mainnet-beta") => void;
};

const ClusterContext = React.createContext({} as ClusterContext);
const { Provider } = ClusterContext;

export const ClusterProvider = ({ children }: { children: ReactNode }) => {
  const [cluster, setCluster] = useState<"devnet" | "mainnet-beta">("devnet");
  const [enableSaveToLocalStorage, setEnableSaveToLocalStorage] =
    useState(false);

  useEffect(() => {
    if (!enableSaveToLocalStorage) {
      return;
    }
    localStorage.setItem("cluster", cluster);
  }, [cluster, enableSaveToLocalStorage]);

  useEffect(() => {
    const storedCluster = localStorage.getItem("cluster") as
      | "devnet"
      | "mainnet-beta";
    if (storedCluster) {
      setCluster(storedCluster);
    }

    setEnableSaveToLocalStorage(true);
  }, []);

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
