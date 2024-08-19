"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import "../navbar.styles.css";
import dynamic from "next/dynamic";
import MenuIcon from "../../Icons/menuIcon";
import "@solana/wallet-adapter-react-ui/styles.css";
import { usePathname } from "next/navigation";

const WalletMultiButtonDynamic = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const SidebarResponsive = ({ isOpen, setIsOpen }: any): JSX.Element => {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>("Dashboard");
  const path = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (path === "/") {
      setActive("Dashboard");
    } else if (path === "/about") {
      setActive("About");
    } else if (path === "/create") {
      setActive("Create");
    }
  }, [path]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && <div className={isOpen ? "wall" : ""} />}

      <header className={`h-[72px] top-0 w-full z-50 bg-transparent absolute`}>
        <div
          className={
            "flex justify-between items-center h-[72px] px-4 ct-md:px-10"
          }
        >
          <Link href="/" onClick={handleToggle}>
            <p className="text-toekn-orange text-toekn-banner-header-mobile font-toekn-regular z-10 cursor-pointer">
              Toekn.
            </p>
          </Link>

          <div className="flex items-center gap-x-4">
            {mounted && <WalletMultiButtonDynamic />}
            <button onClick={handleToggle}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      <div
        className={`top-0 right-0 fixed z-50 bg-toekn-black font-toekn-regular w-full max-w-[450px] h-full py-10 px-[24px] overflow-scroll ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ease-in-out duration-300`}
      >
        <div className="w-full px-2 flex items-center justify-between">
          <Link href="/" onClick={handleToggle}>
            <p className="text-toekn-orange text-toekn-title font-toekn-regular z-10 cursor-pointer">
              Toekn.
            </p>
          </Link>

          <button className={""} onClick={handleToggle}>
            <CloseIcon />
          </button>
        </div>

        <ul className="w-full text-[20px] mt-20 flex flex-col gap-y-8 text-center">
          <li
            onClick={handleToggle}
            className={`cursor-pointer ${
              active === "Dashboard" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            <Link href="/">Dashboard</Link>
          </li>
          <li
            onClick={handleToggle}
            className={`cursor-pointer ${
              active === "Create" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            <Link href="/create">Create Escrow</Link>
          </li>
          <li
            onClick={handleToggle}
            className={`cursor-pointer ${
              active === "About" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            <Link href="/about">About</Link>
          </li>
          <li
            onClick={() =>
              window.open(
                "https://github.com/arjunpotter17/talent-escrow-frontend-task",
                "_blank"
              )
            }
            className="text-toekn-white cursor-pointer"
          >
            Github
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidebarResponsive;
