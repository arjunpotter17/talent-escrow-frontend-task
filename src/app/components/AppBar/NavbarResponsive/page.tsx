import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import "../navbar.styles.css";
import dynamic from "next/dynamic";
import MenuIcon from "../../Icons/menuIcon";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useRouter, usePathname } from "next/navigation";

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
  const router = useRouter();
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

  const handleClick = (route: string) => {
    setIsOpen(!isOpen);
    router.push(route);
  };

  return (
    <>
      {isOpen && <div className={isOpen ? "wall" : ""} />}

      <header
        className={` h-[72px] top-0 w-full z-50 bg-transparent absolute `}
      >
        <div
          className={
            "flex justify-between items-center h-[72px] px-4 ct-md:px-10"
          }
        >
          {
            <Link href={"/"}>
              <p className="text-toekn-orange text-toekn-banner-header-mobile font-toekn-regular z-10 cursor-pointer">
                Toekn.
              </p>
            </Link>
          }

          <div className="flex items-center gap-x-4">
            {mounted && <WalletMultiButtonDynamic />}
            <button onClick={() => setIsOpen(!isOpen)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      <div
        className={`top-0 right-0 fixed z-50 bg-toekn-black  font-toekn-regular w-full max-w-[450px]  h-full py-10 px-[24px] overflow-scroll ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ease-in-out duration-300`}
      >
        {
          <div className="w-full px-2 flex items-center justify-between">
            <p
              onClick={() => handleClick("/")}
              className="text-toekn-orange text-toekn-title font-toekn-regular z-10 cursor-pointer"
            >
              Toekn.
            </p>

            <button className={""} onClick={() => setIsOpen(!isOpen)}>
              <CloseIcon />
            </button>
          </div>
        }

        <ul className="w-full text-[20px] mt-20 flex flex-col gap-y-8 text-center">
          <li
            onClick={() => handleClick("/")}
            className={`cursor-pointer ${
              active === "Dashboard" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            Dashboard
          </li>
          <li
            onClick={() => handleClick("/create")}
            className={`cursor-pointer ${
              active === "Create" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            Create Escrow
          </li>
          <li
          onClick={() => handleClick("/about")}
            className={`cursor-pointer ${
              active === "About" ? "text-toekn-orange" : "text-toekn-white"
            }`}
          >
            About
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
