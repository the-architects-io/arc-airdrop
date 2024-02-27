import { DispenserCost } from "@/app/blueprint/types";
import fetchTokenBalances from "@/app/blueprint/utils/fetch-token-balances";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

const useCostBalance = (
  cost: DispenserCost[] | null,
  walletAddress: PublicKey | string | null
) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);

  const getCostBalance = useCallback(
    async (mintAddress: string, walletAddress: PublicKey | string) => {
      setIsLoading(true);
      const balances = await fetchTokenBalances([mintAddress], walletAddress);
      const balance = balances?.[0].amount;
      console.log(balances);

      if (typeof balance === "number") {
        setBalance(balance);
      } else {
        console.error(balances);
      }
      setHasBeenFetched(true);
      setIsLoading(false);
    },
    [setBalance, setIsLoading, setHasBeenFetched]
  );

  useEffect(() => {
    if (hasBeenFetched) return;
    const token = cost?.[0]?.token;
    if (!walletAddress || !token) return;
    const mintAddress = token?.mintAddress;
    getCostBalance(mintAddress, walletAddress);
  }, [cost, getCostBalance, hasBeenFetched, walletAddress]);

  return {
    balance,
    isLoading,
  };
};

export default useCostBalance;
