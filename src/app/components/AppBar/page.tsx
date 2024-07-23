"use client";
import React, { useEffect, useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const Navbar = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return <div className="!z-50">{mounted && <WalletMultiButtonDynamic />}</div>;
};

export default Navbar;
