"use client";
import "../globals.css";
import React, { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import Navbar from "../components/AppBar/appbar";
import { PopupProvider } from "../hooks/use-popup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const endpoint = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <PopupProvider>
            <ToastContainer
              position="bottom-right"
              autoClose={2500}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <div className="relative !bg-black !overflow-y-auto scroll-smooth">
              <Navbar />
              {children}
            </div>
          </PopupProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
