import React from "react";
import { TokenData } from "../types";
import './dropdown.css';

interface TokenDropdownProps {
  tokens: TokenData[];
  handleTokenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  handleTokenChange,
}) => (
  <div className="mb-4">
    <label
      className="block text-toekn-orange font-toekn-regular text-sm font-bold mb-2"
      htmlFor="token-dropdown"
    >
      Select Token
    </label>
    <select
      id="token-dropdown"
      onChange={handleTokenChange}
      className="shadow appearance-none rounded w-full py-2 px-3 text-toekn-white leading-tight focus:outline-none focus:shadow-outline border border-toekn-white bg-transparent"
    >
      <option value="">Select a token</option>
      {tokens.map((token) => (
        <option className="option" key={token.address.toBase58()} value={token.address.toBase58()}>
          {token.name}
        </option>
      ))}
    </select>
  </div>
);

export default TokenDropdown;
