import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
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
} from "@solana/spl-token";

const programId = new PublicKey("7gW2yGMScBLiHhGPmFxjb83Vay6DrAtuP1BjjUct85ZX");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

interface Window {
  solana?: any;
}


const tokenProgram = TOKEN_PROGRAM_ID;

export const getProvider = async () => {
  if ((window as Window & typeof globalThis).solana) {
    await (window as Window & typeof globalThis).solana.connect();
    const wallet = (window as Window & typeof globalThis).solana;
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "finalized",
    });
    return { provider, wallet };
  } else {
    throw new Error("Phantom wallet not found");
  }
};


export const createEscrow = async (
  initMint: PublicKey,
  mintB: PublicKey,
  seed: BN,
  amount: number,
  receive: number

) => {
  const { provider, wallet } = await getProvider();
  const maker = wallet.publicKey;
  const program = new Program<Escrow>(IDL, provider);
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

    const { blockhash } = await provider.connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = maker;

    const signedInitTx = await wallet.signTransaction(tx);
    const txId = await provider.connection.sendRawTransaction(
      signedInitTx.serialize(),
      { skipPreflight: false, preflightCommitment: "finalized" }
    );

    console.log("Transaction signature for make:", txId);
    return {
      txId,
      escrow:escrow.toBase58(),
    }
  } catch (error) {
    console.error("Error creating escrow:", error);
  }
};

export const refundEscrow = async (
  escrowAddress: PublicKey,
  mintA: PublicKey,
  makerAtaA: PublicKey,
  seed: BN
) => {
  const { provider, wallet } = await getProvider();
  const maker = wallet.publicKey;
  const program = new Program<Escrow>(IDL, provider);

  const [escrow, bump] = await PublicKey.findProgramAddress(
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

    const { blockhash } = await provider.connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = maker;

    const signedInitTx = await wallet.signTransaction(tx);
    const txId = await provider.connection.sendRawTransaction(
      signedInitTx.serialize(),
      { skipPreflight: false, preflightCommitment: "processed" }
    );

    console.log("Transaction signature for refund:", txId);
    return txId;
  } catch (error) {
    console.error("Error refunding escrow:", error);
  }
};

export const takeEscrow = async (
  escrowAddress: PublicKey,
  mintA: PublicKey,
  mintB: PublicKey,
  maker: PublicKey,
) => {
  const { provider, wallet } = await getProvider();//
  const taker = wallet.publicKey;//
  const program = new Program<Escrow>(IDL, provider);//

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
        escrow:escrowAddress,
        vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const blockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = taker;
    const signedTx = await wallet.signTransaction(tx);
    console.log(signedTx, 'trans')
    const txId = await provider.connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: false, preflightCommitment: "processed" }
    );

    console.log("Transaction signature for take:", txId);
    return txId
  } catch (error) {
    console.error("Error taking escrow:", error);
  }
};
