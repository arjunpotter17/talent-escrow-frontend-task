"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "../CloseIcon/CloseIcon";
import CopyToClipboard from "react-copy-to-clipboard";

const Popup = ({
  onClose,
  explorerLink,
  title,
  subTitle,
  escrowAddress,
  blink,
}: any) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the opening animation after the component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Small delay to apply the opening animation

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 500); // Duration of the closing animation
  };

  const handleCopy = () => {
    alert("Link copied to clipboard!");
  };

  return (
    <>
      {isAnimating && (
        <div
          className={`!z-50 fixed inset-0 flex items-center justify-center bg-toekn-popup-bg bg-opacity-65 transition-opacity duration-500 ease-in-out ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`flex flex-col bg-black shadow-lg w-full max-w-lg mx-4 sm:mx-auto transform transition-transform duration-500 ease-in-out pb-10 ${
              isVisible ? "scale-100" : "scale-50"
            }`}
          >
            <button onClick={handleClose} className="self-end">
              <CloseIcon color="#A04000" />
            </button>
            <div className="text-gray-300 mx-4">
              <h2 className="text-toekn-title md:text-toekn-title font-toekn-semibold text-toekn-white">
                {title || "Transaction Details"}
              </h2>
              <p className="text-toekn-subtitle-mobile font-toekn-regular ct-md:text-toekn-subtitle mt-1">
                {subTitle || ""}
              </p>
              {escrowAddress && (
                <p className="mt-1 text-toekn-subtitle-mobile font-toekn-regular ct-md:text-toekn-subtitle">
                  Escrow Address: {escrowAddress}
                </p>
              )}
              {explorerLink && (
                <p
                  onClick={() =>
                    window.open(
                      `https://explorer.solana.com/tx/${explorerLink}?cluster=devnet`,
                      "_blank"
                    )
                  }
                  className="text-toekn-subtitle-mobile cursor-pointer mt-1 font-toekn-regular ct-md:text-toekn-subtitle hover:underline"
                >
                  Visit Explorer
                </p>
              )}
              {blink && (
                <div className="mt-2">
                  <div className="text-toekn-orange text-base font-toekn-regular text-justify">
                    {blink.slice(0, 50)}...
                  </div>
                  <CopyToClipboard text={blink} onCopy={handleCopy}>
                    <button className="px-3 py-2 bg-toekn-orange text-sm hover:bg-toekn-dark-orange hover:text-white hover:border-toekn-orange mt-2">
                      Copy Blink!
                    </button>
                  </CopyToClipboard>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
