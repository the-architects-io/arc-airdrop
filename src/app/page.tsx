"use client";
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { FolderIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import classNames from "classnames";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DrivePage() {
  const wallet = useWallet();

  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [storageAccounts, setStorageAccounts] = useState<
    { account: StorageAccountV2; publicKey: PublicKey }[]
  >([]);

  const fetchStorageAccounts = async (drive: ShdwDrive) => {
    const accounts = await drive.getStorageAccounts();

    if (accounts.length === 0) return;

    setStorageAccounts(accounts);
    setIsLoading(false);
  };

  const getFormattedSize = (amount: number) => {
    // return largest relevant unit between bytes, kilobytes, megabytes, gigabytes, terabytes
    if (amount < 1000) return `${amount} bytes`;
    if (amount < 1000000) return `${(amount / 1000).toFixed(2)} KB`;
    if (amount < 1000000000) return `${(amount / 1000000).toFixed(2)} MB`;
    if (amount < 1000000000000) return `${(amount / 1000000000).toFixed(2)} GB`;
    return `${(amount / 1000000000000).toFixed(2)} TB`;
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        // Always use mainnet
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);
        fetchStorageAccounts(drive);
      } else {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  if (isLoading || !wallet?.publicKey)
    return (
      <ContentWrapper className="w-full flex justify-center pt-64">
        {isLoading && <Spinner />}
        {!isLoading && <WalletButton />}
      </ContentWrapper>
    );

  return (
    <div className="min-h-screen">
      <ContentWrapper className="flex flex-col items-center">
        {!!shadowDrive && !!storageAccounts.length ? (
          <div className="flex flex-col mb-8 items-center w-full">
            <div className="flex flex-wrap justify-center w-full mx-auto">
              {storageAccounts.map(({ publicKey, account }, i) => (
                <div
                  className={classNames(["p-2 w-full md:w-1/2 lg:w-1/3"])}
                  key={publicKey?.toString() || i}
                >
                  <div className="flex flex-col flex-1 h-full space-x-4 p-4">
                    <div className="flex flex-col items-center justify-center overflow-x-hidden ">
                      <Link
                        href={`${BASE_URL}/me/drive/${publicKey?.toString()}`}
                        className="text-center hover:text-sky-200"
                      >
                        <FolderIcon className="w-16 h-16 mb-3 mt-2 mx-auto" />
                        <div className="text-xl lg:text-3xl mb54 truncate mb-5">
                          {account?.identifier}
                        </div>
                        <div className="flex items-center text-gray-200 justify-center w-full">
                          <div className="text-sm uppercase mr-2">size:</div>
                          <div className="text-lg">
                            {getFormattedSize(Number(account?.storage))}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <h1 className="mb-4 text-2xl">No Drives</h1>
          </>
        )}
      </ContentWrapper>
      <div className="absolute bottom-6 right-6">
        <Link href={`${BASE_URL}/me/drive/create`}>
          <PlusCircleIcon className="w-16 h-16 text-sky-200 hover:text-sky-300 cursor-pointer" />
        </Link>
      </div>
    </div>
  );
}
