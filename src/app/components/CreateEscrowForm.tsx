import React from "react";
import { TokenDropdown, AmountInput, MintAddressForm } from "./index";
import { CreateEscrowFormProps, TokenData } from "../interfaces";
import Spinner from "./Spinner/Spinner";
import { useWallet } from "@solana/wallet-adapter-react";

const CreateEscrowForm: React.FC<CreateEscrowFormProps> = ({
  tokens,
  amountToSend,
  receiveMintAddress,
  receiveAmount,
  fetchingMints,
  handleCreateEscrow,
  handleTokenChange,
  setAmountToSend,
  setReceiveMintAddress,
  setReceiveAmount,
  loading,
}) => {
  const { publicKey } = useWallet();
  return (
    <form className="w-full max-w-lg">
      <TokenDropdown
        tokens={tokens}
        handleTokenChange={handleTokenChange}
        fetchingMints={fetchingMints}
      />
      <AmountInput
        id="amount-to-send"
        label="Amount to Send"
        value={amountToSend}
        onChange={(e) => setAmountToSend(Number(e.target.value))}
        disabled={!publicKey}
      />
      <MintAddressForm
        id="receive-mint-address"
        label="Mint Address of the token you wish to receive"
        value={receiveMintAddress}
        onChange={(e) => setReceiveMintAddress(e.target.value)}
        disabled={!publicKey}
      />
      <AmountInput
        id="receive-amount"
        label="Amount you wish to receive"
        value={receiveAmount}
        onChange={(e) => setReceiveAmount(Number(e.target.value))}
        disabled={!publicKey}
      />
      <button
        type="button"
        disabled={!publicKey}
        onClick={handleCreateEscrow}
        className="bg-toekn-orange hover:bg-toekn-dark-orange text-white font-toekn-regular py-2 px-4 w-[150px]"
      >
        {loading ? <Spinner size={25} color="#fff" /> : "Create Escrow"}
      </button>
    </form>
  );
};

export default CreateEscrowForm;
