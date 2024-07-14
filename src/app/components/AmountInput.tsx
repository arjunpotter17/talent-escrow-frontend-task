import React from 'react';

interface AmountInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({ id, label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-toekn-orange font-toekn-regular text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      type="number"
      value={value}
      min="1"
      max="100" // You should replace this with the actual max tokens available for the selected token
      onChange={onChange}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-toekn-white leading-tight focus:outline-none focus:shadow-outline border-toekn-white bg-transparent"
    />
  </div>
);

export default AmountInput;
