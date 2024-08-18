"use client";
import React, { useEffect, useState } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// Dynamic import for the WalletMultiButton to avoid SSR issues
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

  // Prefetch routes to improve page switching speed
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/about");
    router.prefetch("/create");
  }, [router]);

  // Set the active navigation item based on the current path
  useEffect(() => {
    const routeMap: Record<string, string> = {
      "/": "Dashboard",
      "/about": "About",
      "/create": "Create",
    };
    setActive(routeMap[path] || "Dashboard");
  }, [path]);

  // Ensure the WalletMultiButton is only rendered on the client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="!z-50 w-full justify-between flex items-center absolute py-4 px-10">
      <Link href="/" passHref>
        <p className="text-toekn-orange text-toekn-banner-header-mobile font-toekn-regular z-10 cursor-pointer">
          Toekn.
        </p>
      </Link>
      <div className="flex items-center justify-center gap-x-10 text-toekn-white font-toekn-regular">
        <Link href="/" passHref>
          <p
            className={`cursor-pointer hover:text-toekn-orange ${
              active === "Dashboard"
                ? "text-toekn-orange"
                : "text-toekn-white"
            }`}
          >
            Dashboard
          </p>
        </Link>
        <Link href="/about" passHref>
          <p
            className={`cursor-pointer hover:text-toekn-orange ${
              active === "About" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            About
          </p>
        </Link>
        <Link href="/create" passHref>
          <p
            className={`cursor-pointer hover:text-toekn-orange ${
              active === "Create" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            Create Escrow
          </p>
        </Link>
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
