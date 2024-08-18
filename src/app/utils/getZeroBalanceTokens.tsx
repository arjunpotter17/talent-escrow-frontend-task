import { TokenListProvider, ENV } from "@solana/spl-token-registry";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";
import { BN } from "@project-serum/anchor";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const getNonZeroBalanceTokens = async (
  mintAddresses: PublicKey[],
  key: PublicKey
) => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(key, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  const nonZeroBalanceMintAddresses: PublicKey[] = [];

  for (const tokenAccount of tokenAccounts.value) {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    const mint = new PublicKey(accountData.mint);
    const balance = new BN(accountData.amount, 10, "le").toNumber();

    if (
      balance > 0 &&
      mintAddresses.some((mintAddress) => mintAddress.equals(mint))
    ) {
      nonZeroBalanceMintAddresses.push(mint);
    }
  }

  return nonZeroBalanceMintAddresses;
};
