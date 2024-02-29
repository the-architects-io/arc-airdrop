"use client";
import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { useSignOut, useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import {
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

export default function UserMenu() {
  const user = useUserData();
  const { signOut } = useSignOut();
  const { disconnect, select, wallet, publicKey } = useWallet();

  if (!user) {
    return <></>;
  }

  const handleSignOut = async () => {
    localStorage.removeItem("userId");
    await signOut();
  };

  const handleDisconnectWallet = () => {
    localStorage.removeItem("publicKey");
    disconnect();
  };

  return (
    <div className="top-4 right-4 absolute">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="rounded-full text-gray-600 px-4 py-2 text-sm shadow-deep">
            <UserIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-400 rounded-md bg-gray-100 shadow-xl ring-1 ring-cyan-300 ring-opacity-5 focus:outline-none">
            <div className="flex items-center hover:bg-cyan-500 hover:text-gray-100 group p-2 rounded-md rounded-b-none">
              {!!publicKey ? (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDisconnectWallet}
                      className="flex items-center hover:bg-cyan-500 hover:text-gray-100 group rounded w-full"
                    >
                      <WalletIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-100" />
                      <div className="-mt-[1px]">disconnect wallet</div>
                    </button>
                  )}
                </Menu.Item>
              ) : (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/connect-wallet"
                      className="flex items-center hover:bg-cyan-500 hover:text-gray-100 group rounded w-full"
                    >
                      <WalletIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-100" />
                      <div className="-mt-[1px]">connect wallet</div>
                    </Link>
                  )}
                </Menu.Item>
              )}
            </div>
            <div className="flex items-center hover:bg-cyan-500 hover:text-gray-100 group p-2 rounded-md rounded-t-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleSignOut()}
                    className="flex items-center hover:bg-cyan-500 hover:text-gray-100 group rounded w-full"
                  >
                    <ArrowLeftStartOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-100" />
                    log out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
