import { BN, Program } from "@coral-xyz/anchor";
import { IDL, Escrow } from "./idl";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetchTokenMetadata } from "../utils/fetchTokenMetada";

//common constants
const programId = new PublicKey("7gW2yGMScBLiHhGPmFxjb83Vay6DrAtuP1BjjUct85ZX");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new Program<Escrow>(IDL, { connection });
const tokenProgram = TOKEN_PROGRAM_ID;

//function to create escrow
export const createEscrow = async (
  initMint: PublicKey,
  mintB: PublicKey,
  seed: BN,
  amount: number,
  receive: number,
  wallet: WalletContextState
) => {
  const maker = wallet.publicKey;
  if (!maker) return;

  if (!wallet.signTransaction) {
    console.error("Wallet does not support signing transactions");
    return;
  }
  const makerAtaA = getAssociatedTokenAddressSync(initMint, maker, false);

  const escrow = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
    ],
    programId
  )[0];

  const vault = getAssociatedTokenAddressSync(
    initMint,
    escrow,
    true,
    tokenProgram
  );

  try {
    const tx = await program.methods
      .make(seed, new BN(amount), new BN(receive))
      .accountsPartial({
        maker,
        mintB: mintB,
        makerAtaA: makerAtaA,
        escrow,
        vault,
        tokenProgram: tokenProgram,
        systemProgram: SystemProgram.programId,
        mintA: initMint,
      })
      .transaction();

    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = maker;

    const signedInitTx = await wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedInitTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "finalized",
    });

    console.log("Transaction signature for make:", txId);
    return {
      txId,
      escrow: escrow.toBase58(),
    };
  } catch (error) {
    console.error("Error creating escrow:", error);
  }
};

//function to refund escrow
export const refundEscrow = async (
  escrowAddress: PublicKey,
  mintA: PublicKey,
  makerAtaA: PublicKey,
  seed: BN,
  wallet: WalletContextState
) => {
  const maker = wallet.publicKey;
  if (!maker) return;

  if (!wallet.signTransaction) {
    console.error("Wallet does not support signing transactions");
    return;
  }

  const [escrow] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
    ],
    programId
  );

  const vault = getAssociatedTokenAddressSync(
    mintA,
    escrow,
    true,
    TOKEN_PROGRAM_ID
  );

  try {
    const tx = await program.methods
      .refund()
      .accountsPartial({
        maker,
        mintA,
        makerAtaA: makerAtaA,
        escrow: escrowAddress,
        vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = maker;

    const signedInitTx = await wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedInitTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "processed",
    });

    console.log("Transaction signature for refund:", txId);
    return txId;
  } catch (error) {
    console.error("Error refunding escrow:", error);
  }
};

//function to take from escrow
export const takeEscrow = async (
  escrowAddress: PublicKey,
  mintA: PublicKey,
  mintB: PublicKey,
  maker: PublicKey,
  wallet: WalletContextState
) => {
  const taker = wallet.publicKey;
  if (!taker) return;

  if (!wallet.signTransaction) {
    console.error("Wallet does not support signing transactions");
    return;
  }

  const vault = getAssociatedTokenAddressSync(
    mintA,
    escrowAddress,
    true,
    tokenProgram
  );

  const takerAtaA = getAssociatedTokenAddressSync(
    mintA,
    taker,
    true,
    tokenProgram
  );
  const takerAtaB = getAssociatedTokenAddressSync(
    mintB,
    taker,
    true,
    tokenProgram
  );
  const makerAtaB = getAssociatedTokenAddressSync(
    mintB,
    maker,
    true,
    tokenProgram
  );

  try {
    const tx = await program.methods
      .take()
      .accountsPartial({
        taker,
        maker,
        mintA,
        mintB,
        takerAtaA: takerAtaA,
        takerAtaB: takerAtaB,
        makerAtaB: makerAtaB,
        escrow: escrowAddress,
        vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = taker;
    const signedTx = await wallet.signTransaction(tx);
    console.log(signedTx, "trans");
    const txId = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "processed",
    });

    console.log("Transaction signature for take:", txId);
    return txId;
  } catch (error) {
    console.error("Error taking escrow:", error);
    toast.error("Error withdrawing from escrow");
  }
};

export const getAllEscrows = () => useSWR(
  'ALL_ESCROWS',
  async () => {
    const escrows = await program.account.escrow.all();
    
    const promises = escrows.map(async (escrow) => {
      const { account, publicKey } = escrow;
      
      const tokenNames = await fetchTokenMetadata([
        escrow.account.mintA,
        escrow.account.mintB,
      ]);
      
      const vault = getAssociatedTokenAddressSync(
        escrow.account.mintA,
        escrow.publicKey,
        true
      );
      
      const deposit = await connection.getTokenAccountBalance(vault);
      const mintInfo = await getMint(connection, escrow.account.mintB);
      
      const expectedAmountToReceive = account.receive
        .div(new BN(10 ** mintInfo.decimals))
        .toNumber();
      
      return {
        address: publicKey,
        maker: account.maker,
        mintA: account.mintA,
        tokenNameA: tokenNames[0]?.name,
        logoA: tokenNames[0]?.logo,
        mintB: account.mintB,
        tokenNameB: tokenNames[1]?.name,
        logoB: tokenNames[1]?.logo,
        deposit: deposit.value.uiAmount ?? 0,
        expectedAmountToReceive,
      };
    });

    return Promise.all(promises);
  },
  {
    
    revalidateOnReconnect: false,
  }
);
