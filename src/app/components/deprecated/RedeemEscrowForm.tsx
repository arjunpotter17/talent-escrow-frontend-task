import React from "react";
import { EscrowAddressInput, EscrowStateDetails } from "../index";
import Spinner from "../Spinner/Spinner";
import { RedeemEscrowFormProps } from "@/app/interfaces";

const RedeemEscrowForm: React.FC<RedeemEscrowFormProps> = ({
  escrowAddress,
  escrowState,
  fetchLoading,
  withdrawLoading,
  handleFetchEscrowState,
  handleWithdraw,
  setEscrowAddress,
}) => {
  return (
    <form className="w-full max-w-lg">
      <p className="text-toekn-white text-sm font-bold mb-4">
        Enter the address of the escrow account you&apos;d like to trade with.
      </p>

      <EscrowAddressInput
        value={escrowAddress}
        onChange={(e) => setEscrowAddress(e.target.value)}
      />
      <button
        type="button"
        onClick={() => handleFetchEscrowState(escrowAddress)}
        className="bg-toekn-orange hover:bg-toekn-dark-orange text-white font-bold py-2 px-4"
      >
        {fetchLoading ? (
          <Spinner size={25} color="#fff" />
        ) : (
          "Fetch Escrow State"
        )}
      </button>
      {escrowState && (
        <EscrowStateDetails
          loading={withdrawLoading}
          escrowState={escrowState}
          handleWithdraw={handleWithdraw}
        />
      )}
    </form>
  );
};

export default RedeemEscrowForm;
