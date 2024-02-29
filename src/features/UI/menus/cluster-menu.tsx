"use client";

import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useCluster } from "@/hooks/cluster";
import { useUserData } from "@nhost/nextjs";

export default function ClusterMenu() {
  const { cluster, setCluster } = useCluster();
  const user = useUserData();

  if (!user?.roles?.includes("admin")) {
    return <></>;
  }

  return (
    <div className="absolute top-5 right-24 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-400 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            {cluster === "devnet" ? "Devnet" : "Mainnet"}
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-sky-200 hover:text-sky-100"
              aria-hidden="true"
            />
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
          <Menu.Items className="absolute right-0 mt-2 w-28 origin-top-right divide-y divide-sky-200 rounded-md bg-black text- shadow-lg ring-1 ring-gray-300 ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setCluster("devnet")}
                    className={`${
                      active ? "bg-sky-300 text-black" : "text-gray-100"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Devnet
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setCluster("mainnet-beta")}
                    className={`${
                      active ? "bg-sky-300 text-black" : "text-gray-100"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    Mainnet
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
