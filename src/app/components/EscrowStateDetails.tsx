import { PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner/Spinner";

interface EscrowStateDetailsProps {
  escrowState: {
    mintA: PublicKey;
    mintB: PublicKey;
    tokenBalance: number;
    receive: any; // Adjust type as necessary
  };
  loading: boolean;
  handleWithdraw: () => void;
}

const EscrowStateDetails: React.FC<EscrowStateDetailsProps> = ({
    loading,
  escrowState,
  handleWithdraw,
}) => {
  const [mintBDecimals, setMintBDecimals] = useState<number>(0);

  const commitment: Commitment = "confirmed";
  const connection = new Connection(
    "https://api.devnet.solana.com",
    commitment
  );

  useEffect(() => {
    const fetchDecimals = async () => {
      try {
        const mintBInfo = await getMint(connection, escrowState.mintB);

        setMintBDecimals(mintBInfo.decimals);
      } catch (error) {
        console.error("Error fetching token decimals:", error);
      }
    };

    fetchDecimals();
  }, [
    connection,
    escrowState.mintA,
    escrowState.mintB,
    escrowState.tokenBalance,
  ]);

  return (
    <div className="flex flex-col gap-y-4 mt-4 p-4 border text-toekn-white border-toekn-white bg-transparent">
      <p>
        Do you want to swap{" "}
        {escrowState.receive.words[0] / Math.pow(10, mintBDecimals)} of{" "}
        {escrowState.mintB.toBase58()} tokens for {escrowState.tokenBalance} of{" "}
        {escrowState.mintA.toBase58()} tokens?
      </p>
      <button
        type="button"
        onClick={handleWithdraw}
        className="bg-toekn-orange hover:bg-toekn-dark-orange text-white font-toekn-regular py-2 px-4"
      >
        {loading ? <Spinner color="#fff" size={25}/> : "Withdraw"}
      </button>
    </div>
  );
};

export default EscrowStateDetails;
