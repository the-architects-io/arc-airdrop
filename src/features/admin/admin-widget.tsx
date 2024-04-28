"use client";

import { FabButton } from "@/features/UI/buttons/fab-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";

import LogViewerSmall from "@/features/logs/log-viewer-small";
import { useLogs } from "@/hooks/logs";
import { useQuery } from "@apollo/client";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { GET_AIRDROP_BY_ID } from "@the-architects/blueprint-graphql";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminWidget() {
  const [shouldShowLogs, setShouldShowLogs] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { logs, addLog } = useLogs();
  const user = useUserData();
  const path = usePathname();

  const { data, refetch } = useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: path?.split("/")?.pop(),
    },
    skip: !path?.split("/")?.pop(),
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const isAdmin = user?.roles.includes("admin");
    setIsAdmin(isAdmin || false);
  }, [user]);

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {shouldShowLogs && (
        <div className="w-[400px] p-4 fixed top-0 bottom-24 right-0 z-20 overflow-auto">
          <div className="p-4 py-6 border border-gray-300 h-full rounded-lg text-sm shadow-deep-float backdrop-blur-md bg-gray-100 bg-opacity-80 backdrop-opacity-100 backdrop-contrast-120 flex flex-col">
            <div className="text-lg">LOGS</div>
            <LogViewerSmall close={() => setShouldShowLogs(false)} />
            <div className="flex flex-col flex-1 pt-4" />
            <div className="w-full mb-4">
              {!!data?.airdrops_by_pk?.id && (
                <>
                  <div className="text-lg mb-2">AIRDROP</div>
                  <div className="flex">
                    <div className="text-sm font-bold mr-2">id:</div>
                    <div className="truncate">{data?.airdrops_by_pk?.id}</div>
                  </div>
                </>
              )}
            </div>
            <div className="w-full">
              <div className="text-lg mb-2">TOOLS</div>
              <SecondaryButton onClick={() => addLog("Test log")}>
                add test log
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}
      <div className="fixed z-10 bottom-24 right-4 mt-[2px]">
        <FabButton
          className="rounded-full"
          onClick={() => setShouldShowLogs(!shouldShowLogs)}
        >
          <DocumentIcon className="cursor-pointer w-6 h-6" />
        </FabButton>
      </div>
    </>
  );
}
