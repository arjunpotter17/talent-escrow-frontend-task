import { Program } from "@coral-xyz/anchor";
import { takeEscrow } from "../solana/solana";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Escrow, IDL } from "../solana/idl";
import { toast } from "react-toastify";
import { mutate } from "swr";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new Program<Escrow>(IDL, { connection });

const handleWithdraw = async (address: string, wallet: any) => {
  try {
    const escrowAccount = await program.account.escrow.fetch(address);
    const FAKE_ESCROW = {
      address: new PublicKey(address),
      seed: escrowAccount.seed,
      maker: escrowAccount.maker,
      mintA: escrowAccount.mintA,
      isLoading: true,
    };

    mutate(
      "ALL_ESCROWS",
      (escrows: any) => {
        // Find the index of the escrow to be removed
        const index = escrows.findIndex(
          (escrow: any) => escrow.address.toBase58() === address
        );
        console.log(index);
        // If the escrow is not found, just return the array with the fake escrow at the start
        if (index === -1) return [FAKE_ESCROW, ...escrows];

        // Create a new array with the fake escrow at the same position
        const newEscrows = [...escrows];
        newEscrows.splice(index, 1, FAKE_ESCROW);

        return newEscrows;
      },
      false
    );

    const refundTx = await takeEscrow(
      new PublicKey(address),
      escrowAccount.mintA,
      escrowAccount.mintB,
      escrowAccount.maker,
      wallet
    );
    if (!refundTx) return;
    return refundTx;
  } catch (e: any) {
    console.error("Error withdrawing escrow:", e);
    toast.error("Error withdrawing from escrow");
  } finally {
    mutate("ALL_ESCROWS");
  }
};

export default handleWithdraw;
