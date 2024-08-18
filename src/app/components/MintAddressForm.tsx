import React from 'react';
import { MintAddressFormProps } from '../interfaces';

const MintAddressForm: React.FC<MintAddressFormProps> = ({ id, label, value, onChange, disabled }) => (
  <div className="mb-4">
    <label className="block text-[#747f8b] font-toekn-regular text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      disabled={disabled}
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-toekn-white leading-tight focus:outline-none focus:shadow-outline border-toekn-white bg-transparent"
    />
  </div>
);

export default MintAddressForm;
