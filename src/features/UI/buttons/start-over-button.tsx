"use client";

import { DialogComponent } from "@/features/UI/dialog";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useUserData } from "@nhost/nextjs";
import { useState } from "react";

export const StartOverButton = () => {
  const user = useUserData();

  const clearLocalStorage = () => {
    localStorage.removeItem("selectedSnapshotOptions");
    localStorage.removeItem("airdropId");
    localStorage.removeItem("collectionId");
    localStorage.removeItem("recipientCount");
    localStorage.removeItem("customHashlistCount");
  };

  const handleStartOver = () => {
    clearLocalStorage();
    window.location.reload();
  };

  const handleConfirmStartOver = () => {
    // show confirm dialog
    const text =
      "Are you sure you want to start over? Your progress will be lost.";
    if (confirm(text)) {
      handleStartOver();
    }
  };
  if (!user) return <></>;

  return (
    <>
      <div className="absolute top-4 left-4" onClick={handleConfirmStartOver}>
        <button className="rounded-full text-gray-600 px-4 py-2 text-sm shadow-deep">
          <ArrowUturnLeftIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>
    </>
  );
};
