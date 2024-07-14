import React from 'react';
import { TokenDropdown, AmountInput, MintAddressForm } from './index';
import { TokenData } from '../types';
import Spinner from './Spinner/Spinner';

interface CreateEscrowFormProps {
  tokens: TokenData[];
  selectedToken: TokenData | null;
  amountToSend: number;
  receiveMintAddress: string;
  receiveAmount: number;
  loading: boolean;
  disabled: boolean;
  setLoading: (value: boolean) => void;
  handleCreateEscrow: () => void;
  handleTokenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setAmountToSend: (value: number) => void;
  setReceiveMintAddress: (value: string) => void;
  setReceiveAmount: (value: number) => void;

}

const CreateEscrowForm: React.FC<CreateEscrowFormProps> = ({
  tokens,
  selectedToken,
  amountToSend,
  receiveMintAddress,
  receiveAmount,
  disabled,
  handleCreateEscrow,
  handleTokenChange,
  setAmountToSend,
  setReceiveMintAddress,
  setReceiveAmount,
  loading,
  setLoading
}) => {
  return (
    <form className="w-full max-w-lg">
      <TokenDropdown tokens={tokens} handleTokenChange={handleTokenChange} />
      <AmountInput id="amount-to-send" label="Amount to Send" value={amountToSend} onChange={(e) => setAmountToSend(Number(e.target.value))} />
      <MintAddressForm id="receive-mint-address" label="Receive Mint Address" value={receiveMintAddress} onChange={(e) => setReceiveMintAddress(e.target.value)} />
      <AmountInput id="receive-amount" label="Receive Amount" value={receiveAmount} onChange={(e) => setReceiveAmount(Number(e.target.value))} />
      <button type="button" disabled={disabled} onClick={handleCreateEscrow} className="bg-toekn-orange hover:bg-toekn-dark-orange text-white font-toekn-regular py-2 px-4 w-[150px]">
        {loading ? <Spinner size={25} color='#fff'/> : "Create Escrow"}
      </button>
    </form>
  );
};

export default CreateEscrowForm;
