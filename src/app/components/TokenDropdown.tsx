import React, { useState, useRef, useEffect } from "react";
import { TokenData, TokenDropdownProps } from "../interfaces";
import "./dropdown.css";
import { useWallet } from "@solana/wallet-adapter-react";

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  fetchingMints,
  handleTokenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { publicKey } = useWallet();

  const handleSelect = (token: TokenData) => {
    setSelectedToken(token);
    const event = {
      target: {
        value: token.address.toBase58(),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleTokenChange(event);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!publicKey) {
      setSelectedToken(null);
    }
  }, [publicKey]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label
        className="block text-[#747f8b] font-toekn-semibold text-sm mb-2"
        htmlFor="token-dropdown"
      >
        Select Token
      </label>
      <div
        className={`shadow appearance-none rounded w-full py-2 px-3 text-token-white leading-tight focus:outline-none focus:shadow-outline border border-token-white bg-transparent ${
          publicKey ? "cursor-pointer" : "cursor-not-allowed"
        }`}
        onClick={() => {
          if (!publicKey) return;
          setIsOpen(!isOpen);
        }}
      >
        {selectedToken ? (
          <div className="flex items-center">
            <img
              src={selectedToken.logo || "/solana.jpeg"}
              alt={selectedToken.name}
              className="w-6 h-6 mr-2"
            />
            <div className="flex flex-col">
              <span className="font-toekn-bold text-toekn-orange">
                {selectedToken.name}
              </span>
              <span className="font-toekn-semibold text-toekn-dark-white text-xs">
                {selectedToken.address.toBase58()}
              </span>
            </div>
          </div>
        ) : fetchingMints ? (
          <span className="text-token-white">Fetching Mints...</span>
        ) : tokens?.length === 0 && publicKey ? (
          <span className="text-token-white">
            No SPL tokens detected. Go mint some NFTs.
          </span>
        ) : (
          <span className="text-token-white">Select a token</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute left-0 w-full bg-black border border-token-white mt-1 z-10 rounded max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-toekn-black scrollbar-thumb-toekn-popup-bg scroll-smooth">
          {tokens.map((token) => (
            <div
              key={token.address.toBase58()}
              className="option flex items-center py-2 px-3 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(token)}
            >
              <img
                src={token.logo || "/solana.jpeg"}
                alt={token.name}
                className="w-8 h-8 mr-2"
              />
              <div className="flex flex-col">
                <span className="font-toekn-bold text-toekn-orange">
                  {token.name}
                </span>
                <span className="font-toekn-semibold text-toekn-dark-white text-xs">
                  {token.address.toBase58()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;
