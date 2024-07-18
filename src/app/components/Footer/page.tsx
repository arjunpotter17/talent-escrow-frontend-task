"use client";
import React from "react";

const Footer: React.FC = () => {
  const openGitHub = () => {
    window.open("https://github.com/arjunpotter17/talent-escrow-frontend-task", "_blank");
  };
  return (
    <footer
      className="font-toekn-regular text-toekn-dark-white py-6 max-h-[72px]"
      style={{ backgroundColor: "rgba(15, 20, 28, 0.7)" }}
    >
      <div className="container mx-auto text-center">
        <p onClick={openGitHub} className="hover:underline cursor-pointer">
          View code on github
        </p>
      </div>
    </footer>
  );
};

export default Footer;
