import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { refundEscrow } from "../solana/solana";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Escrow, IDL } from "../solana/idl";
import { toast } from "react-toastify";
import { mutate } from "swr";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new Program<Escrow>(IDL, { connection });

const handleFetchEscrowState = async (address: string, returns?: boolean) => {
  try {
    const escrowAccount = await program.account.escrow.fetch(address);
    return {
      seed: escrowAccount.seed,
      maker: escrowAccount.maker,
      mintA: escrowAccount.mintA,
    };
  } catch (e) {
    console.log(e);
  }
};

const handleCloseEscrow = async (closeEscrowAddress: string, wallet: any) => {
  const tokenProgram = TOKEN_PROGRAM_ID;
  try {
    if (!closeEscrowAddress) {
      toast.error("No escrow address provided");
      return;
    }
    const data = await handleFetchEscrowState(closeEscrowAddress, false);
    if (!data) {
      toast.error("No escrow found");
      return;
    }
    const makerAtaA = getAssociatedTokenAddressSync(
      data.mintA,
      data.maker,
      false,
      tokenProgram
    );
    const PLACEHOLDER_ESCROW = {
      address: new PublicKey(closeEscrowAddress),
      seed: data.seed,
      maker: data.maker,
      mintA: data.mintA,
      isLoading: true,
    };
    mutate(
      "ALL_ESCROWS",
      (escrows: any) => {
        // Find the index of the escrow to be removed
        const index = escrows.findIndex(
          (escrow: any) => escrow.address.toBase58() === closeEscrowAddress
        );

        // If the escrow is not found, just return the array with the fake at the start
        if (index === -1) return [PLACEHOLDER_ESCROW, ...escrows];

        // Create a new array with the fake escrow at the same position
        const newEscrows = [...escrows];
        newEscrows.splice(index, 1, PLACEHOLDER_ESCROW);

        return newEscrows;
      },
      false
    );
    const closeTxId = await refundEscrow(
      new PublicKey(closeEscrowAddress),
      data.mintA,
      makerAtaA,
      data.seed,
      wallet
    );
    return closeTxId;
  } catch (error: any) {
    console.error("Error closing escrow:", error);
    toast.error("Error closing escrow");
    return error;
  }finally{
    mutate("ALL_ESCROWS");
  }
};

export default handleCloseEscrow;
