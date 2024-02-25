import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";

import { ClusterProvider } from "@/hooks/cluster";
import { ContextProvider } from "@/providers/context-provider";

import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";
import { Metadata } from "next";
import UserMenu from "@/features/user-menu";
import { FlowProgressIndicator } from "@/features/flow-progress-indicator";
import { FlowProgressIndicatorWrapper } from "@/features/flow-progress-indicator-wrapper";

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
  title: "The Architects",
  description: "Closing the loop",
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
            <div className="mb-32">{children}</div>
            <Toaster />
            <UserMenu />
            <FlowProgressIndicatorWrapper />
          </ContextProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}
