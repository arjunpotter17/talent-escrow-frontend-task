import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";

import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Escrow, IDL } from "@/app/solana/idl";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";


const DEFAULT_SOL_ADDRESS = "5o3x9hBMDeLe3LYw7PKnyGiBD7LhroMFxt4LS2eoydR1"; //my pubkey, plis no hack
const connection = new Connection(clusterApiUrl("devnet"), "finalized");

export async function GET(req: Request, res: Response) {
  const responseBody: ActionGetResponse = {
    icon: "https://solana.com/_next/static/media/logotype.e4df684f.svg",
    title: "Toekn.",
    description: "Swap SPL tokens on Solana.",
    label: "Accept Swap",
  };

  const response = Response.json(responseBody, {
    headers: ACTIONS_CORS_HEADERS,
  });
  return response;
}

export async function POST(req: Request, res: Response) {
  const postReq: ActionPostRequest = await req.json();
  const userKey = postReq.account;
  const requestUrl = new URL(req.url);
  const { escrow, mintA, mintB, maker } = await validatedQueryParams(requestUrl);
  const program = new Program<Escrow>(IDL, { connection });


  const vault = getAssociatedTokenAddressSync(
    mintA,
    escrow,
    true,
    TOKEN_PROGRAM_ID
  );

  const takerAtaA = getAssociatedTokenAddressSync(
    mintA,
    new PublicKey(userKey),
    true,
    TOKEN_PROGRAM_ID
  );

  const takerAtaB = getAssociatedTokenAddressSync(
    mintB,
    new PublicKey(userKey),
    true,
    TOKEN_PROGRAM_ID
  );

  const makerAtaB = getAssociatedTokenAddressSync(
    mintB,
    maker,
    true,
    TOKEN_PROGRAM_ID
  );

  const tx = await program.methods
    .take()
    .accountsPartial({
      taker: userKey,
      maker,
      mintA,
      mintB,
      takerAtaA: takerAtaA,
      takerAtaB: takerAtaB,
      makerAtaB: makerAtaB,
      escrow,
      vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = new PublicKey(userKey);

  const serialTx = tx
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");

  const responseBody: ActionPostResponse = {
    transaction: serialTx,
    message: "Trade Completed.",
  };

  const response = Response.json(responseBody, {
    headers: ACTIONS_CORS_HEADERS,
  });

  return response;
}

export async function OPTIONS(req: Request, res: Response) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

async function validatedQueryParams(requestUrl: URL) {
  let escrow: PublicKey = new PublicKey(DEFAULT_SOL_ADDRESS);
  let maker: PublicKey = new PublicKey(DEFAULT_SOL_ADDRESS);
  let mintA: PublicKey = new PublicKey(DEFAULT_SOL_ADDRESS);
  let mintB: PublicKey = new PublicKey(DEFAULT_SOL_ADDRESS);

  try {
    if (requestUrl.searchParams.get("escrow")) {
      escrow = new PublicKey(requestUrl.searchParams.get("escrow")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: escrow";
  }

  try {
    if (requestUrl.searchParams.get("maker")) {
      maker = new PublicKey(requestUrl.searchParams.get("maker")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: maker";
  }

  try {
    if (requestUrl.searchParams.get("mintA")) {
      mintA = new PublicKey(requestUrl.searchParams.get("mintA")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: mintA";
  }

  try {
    if (requestUrl.searchParams.get("mintB")) {
      mintB = new PublicKey(requestUrl.searchParams.get("mintB")!);
    }
  } catch (err) {
    throw "Invalid input query parameter: mintB";
  }

  return {
    maker,
    escrow,
    mintA,
    mintB,
  };
}
