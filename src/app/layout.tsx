import "./globals.css";
import { Inter } from "next/font/google";

import { ClusterProvider } from "@/hooks/cluster";
import { ContextProvider } from "@/providers/context-provider";

import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={classNames([inter.className, "relative"])}>
        <ClusterProvider>
          <ContextProvider>
            {children}

            <Toaster />
          </ContextProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}
