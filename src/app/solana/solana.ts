import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { IDL, Escrow } from "./idl";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  AccountLayout,
} from "@solana/spl-token";

const programId = new PublicKey("7gW2yGMScBLiHhGPmFxjb83Vay6DrAtuP1BjjUct85ZX");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

interface Window {
  solana?: any;
}

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

const tokenProgram = TOKEN_PROGRAM_ID;

const ensureAtaExists = async (mint: PublicKey, owner: PublicKey, payer: PublicKey) => {
  const ata = getAssociatedTokenAddressSync(mint, owner, false, ASSOCIATED_TOKEN_PROGRAM_ID);

  const sendTransactionWithRetry = async (tx: Transaction, provider: AnchorProvider, wallet: any, retries: number = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { blockhash } = await provider.connection.getRecentBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = payer;

        const signedInitTx = await wallet.signTransaction(tx);
        const txId = await provider.connection.sendRawTransaction(
          signedInitTx.serialize(),
          { skipPreflight: false, preflightCommitment: "finalized" }
        );
        await provider.connection.confirmTransaction(txId, 'finalized');
        console.log('Transaction signature for creating ATA:', txId);
        return txId;
      } catch (error) {
        console.error(`Transaction failed on attempt ${attempt + 1}: ${error}`);
        if (attempt === retries - 1) {
          throw new Error(`Transaction failed after ${retries} attempts`);
        }
      }
    }
  };

  try {
    await getAccount(connection, ata);
  } catch (error: any) {
    const tx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(payer, ata, owner, mint, TOKEN_PROGRAM_ID)
    );
    const { wallet, provider } = await getProvider();

    await sendTransactionWithRetry(tx, provider, wallet);
  }

  return ata;
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

    console.log("entered tx");

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
    console.error("Error creating mama escrow:", error);
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
  maker: PublicKey
) => {
  const { provider, wallet } = await getProvider();//
  const taker = wallet.publicKey;//
  const program = new Program<Escrow>(IDL, provider);//
  console.log(escrowAddress.toBase58(), 'escrowAddress');

  console.log('escrow', escrowAddress.toBase58());

  const vault = getAssociatedTokenAddressSync(
    mintA,
    escrowAddress,
    true,
    TOKEN_PROGRAM_ID
  );

  console.log(vault.toBase58(), 'vault')
  const takerAtaA = getAssociatedTokenAddressSync(
    mintA,
    taker,
    true,
    TOKEN_PROGRAM_ID
  );
  const takerAtaB = getAssociatedTokenAddressSync(
    mintB,
    taker,
    true,
    TOKEN_PROGRAM_ID
  );
  const makerAtaB = getAssociatedTokenAddressSync(
    mintB,
    maker,
    true,
    TOKEN_PROGRAM_ID
  );

  console.log("takerAtaA", takerAtaA.toBase58());
  console.log("takerAtaB", takerAtaB.toBase58());
  console.log("makerAtaB", makerAtaB.toBase58());


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

    const { blockhash } = await provider.connection.getRecentBlockhash();
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
