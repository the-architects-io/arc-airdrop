import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";

import { ClusterProvider } from "@/hooks/cluster";
import { ContextProvider } from "@/providers/context-provider";

import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";
import { Metadata } from "next";
import UserMenu from "@/features/UI/menus/user-menu";
import { FlowProgressIndicatorWrapper } from "@/features/flow-progress-indicator-wrapper";
import { StartOverButton } from "@/features/UI/buttons/start-over-button";
import { SavingProvider } from "@/app/blueprint/hooks/saving/provider";
import ClusterMenu from "@/features/UI/menus/cluster-menu";

const font = IBM_Plex_Mono({
  weight: "400",
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
});
const fontHeavy = IBM_Plex_Mono({
  weight: "600",
  variable: "--font-ibm-plex-mono-heavy",
  subsets: ["latin"],
  display: "swap",
});

const createPageMetadata = (): Metadata => ({
  title: "architects airdrop",
  description: "the simple way to airdrop solana cnfts",
});

export const metadata: Metadata = createPageMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={classNames(
          font.variable,
          fontHeavy.variable,
          "font-mono text-gray-400 bg-gray-100"
        )}
      >
        <ClusterProvider>
          <ContextProvider>
            <SavingProvider>
              {children}
              <Toaster />
              <StartOverButton />
              <ClusterMenu />
              <UserMenu />
              <FlowProgressIndicatorWrapper />
            </SavingProvider>
          </ContextProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}
