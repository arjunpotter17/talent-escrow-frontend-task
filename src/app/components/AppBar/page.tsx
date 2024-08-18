"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useWindowSize } from "@/app/hooks/use-weindowSize";
import "./navbar.styles.css";

const NavbarDesktop = dynamic(() => import("./NavbarDesktop/page"));
const NavBarResponsive = dynamic(() => import("./NavbarResponsive/page"));

const Sidebar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const windowSize = useWindowSize()[0];

  //switch navbar based on window size
  return windowSize > 900 ? (
    <NavbarDesktop />
  ) : (
    <>
      <NavBarResponsive isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && <div className={"wall"} />}
    </>
  );
};

export default Sidebar;
