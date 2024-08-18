"use client";
import React, { useEffect, useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";

//wallet button on client only
const WalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NavbarDesktop = (): JSX.Element => {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>("Dashboard");
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (path === "/") {
      setActive("Dashboard");
    } else if (path === "/about") {
      setActive("About");
    } else if (path === "/create") {
      setActive("Create");
    }
  }, [path]);

  const handleNavigation = (route: string) => {
    router.push(`${route.toLowerCase()}`);
  };

  //effect to render multiwallet button
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="!z-50 w-full justify-between flex items-center absolute py-4 px-10">
      <p
        onClick={() => handleNavigation("/")}
        className="text-toekn-orange text-toekn-banner-header-mobile font-toekn-regular z-10 cursor-pointer"
      >
        Toekn.
      </p>
      <div className="flex items-center justify-center gap-x-10 text-toekn-white font-toekn-regular">
        <p
          onClick={() => handleNavigation("/")}
          className={`cursor-pointer hover:text-toekn-orange ${
            active === "Dashboard" ? "text-toekn-orange" : "text-toekn-white"
          }`}
        >
          Dashboard
        </p>
        <p
          onClick={() => handleNavigation("/about")}
          className={`cursor-pointer hover:text-toekn-orange ${
            active === "About" ? "text-toekn-orange" : "text-toekn-white"
          }`}
        >
          About
        </p>
        <p
          onClick={() => handleNavigation("/create")}
          className={`cursor-pointer hover:text-toekn-orange ${
            active === "Create" ? "text-toekn-orange" : "text-toekn-white"
          }`}
        >
          Create Escrow
        </p>
        <p
          onClick={() =>
            window.open(
              "https://github.com/arjunpotter17/talent-escrow-frontend-task",
              "_blank"
            )
          }
          className="cursor-pointer hover:text-toekn-orange"
        >
          Github
        </p>

        {mounted && <WalletMultiButtonDynamic />}
      </div>
    </div>
  );
};

export default NavbarDesktop;
