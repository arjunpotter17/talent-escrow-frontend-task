import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
  } from "@solana/web3.js";
  import {
    MINT_SIZE,
    TOKEN_2022_PROGRAM_ID,
    createAssociatedTokenAccountIdempotentInstruction,
    createInitializeMint2Instruction,
    createMintToInstruction,
    getAssociatedTokenAddressSync,
    getMinimumBalanceForRentExemptMint,
  } from "@solana/spl-token";
  import { AnchorProvider, BN } from "@coral-xyz/anchor";
  import { randomBytes } from "crypto";
  
  const tokenProgram = TOKEN_2022_PROGRAM_ID;
  
  interface Window {
    solana?: any;
  }
  
  const getProvider = async () => {
    if ((window as Window & typeof globalThis).solana) {
      await (window as Window & typeof globalThis).solana.connect();
      const wallet = (window as Window & typeof globalThis).solana;
      const connection = new Connection("http://127.0.0.1:8899", "confirmed");
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      return { provider, wallet };
    } else {
      throw new Error("Phantom wallet not found");
    }
  };
  
  export const airdropAndCreateMints = async () => {
    const { provider, wallet } = await getProvider();
    const connection = provider.connection;
  
    const maker = wallet.publicKey;

    const signer = new PublicKey(maker)
  
    console.log('maker', maker)
    const taker = Keypair.generate();
    const mintA = Keypair.generate();
    const mintB = Keypair.generate();
  
    const makerAtaA = getAssociatedTokenAddressSync(
      mintA.publicKey,
      signer,
      false,
      tokenProgram
    );
    const makerAtaB = getAssociatedTokenAddressSync(
      mintB.publicKey,
      signer,
      false,
      tokenProgram
    );
    const takerAtaA = getAssociatedTokenAddressSync(
      mintA.publicKey,
      taker.publicKey,
      false,
      tokenProgram
    );
    const takerAtaB = getAssociatedTokenAddressSync(
      mintB.publicKey,
      taker.publicKey,
      false,
      tokenProgram
    );
  
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
  
    let tx = new Transaction();
    tx.instructions = [
      ...[maker, taker].map((account) =>
        SystemProgram.transfer({
          fromPubkey: maker,
          toPubkey: account.publicKey,
          lamports: 10 * LAMPORTS_PER_SOL,
        })
      ),
      ...[mintA, mintB].map((mint) =>
        SystemProgram.createAccount({
          fromPubkey: maker,
          newAccountPubkey: mint.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: tokenProgram,
        })
      ),
      ...[
        { mint: mintA.publicKey, authority: maker, ata: makerAtaA },
        { mint: mintB.publicKey, authority: taker.publicKey, ata: takerAtaB },
      ].flatMap((x) => [
        createInitializeMint2Instruction(
          x.mint,
          6,
          x.authority,
          null,
          tokenProgram
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          maker,
          x.ata,
          x.authority,
          x.mint,
          tokenProgram
        ),
        createMintToInstruction(
          x.mint,
          x.ata,
          x.authority,
          1e9,
          undefined,
          tokenProgram
        ),
      ]),
    ];
  
    const { blockhash } = await provider.connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = signer;
  
    try {
      const signedTx = await wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "processed",
      });
      console.log("Transaction signature for airdrop and create mints:", txId);
    } catch (error) {
      console.error("Error signing or sending transaction: ", error);
    }
  };
  
  airdropAndCreateMints();
  