import { EscrowAddressInputProps } from "@/app/interfaces";
import React from "react";

const EscrowAddressInput: React.FC<EscrowAddressInputProps> = ({
  value,
  onChange,
}) => (
  <div className="mb-4 w-full">
    <label
      className="block text-toekn-orange text-sm font-bold mb-2"
      htmlFor="escrow-address"
    >
      Escrow Address
    </label>
    <input
      id="escrow-address"
      type="text"
      value={value}
      onChange={onChange}
      className="shadow appearance-none border border-toekn-white bg-transparent rounded w-full py-2 px-3 text-toekn-white leading-tight focus:outline-none focus:shadow-outline"
    />
  </div>
);

export default EscrowAddressInput;
