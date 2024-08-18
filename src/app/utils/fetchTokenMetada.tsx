import { TokenListProvider, ENV } from "@solana/spl-token-registry";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const fetchTokenMetadata = async (mints: PublicKey[]) => {
  const metaplex = Metaplex.make(connection);

  const provider = await new TokenListProvider().resolve();
  const tokenList = provider.filterByChainId(ENV.Devnet).getList();

  const tokenMap = tokenList.reduce((map, item) => {
    map.set(item.address, item);
    return map;
  }, new Map());

  const tokensData = await Promise.all(
    mints.map(async (mint) => {
      const metadataAccount = metaplex.nfts().pdas().metadata({ mint });

      const metadataAccountInfo = await connection.getAccountInfo(
        metadataAccount
      );

      let tokenName = mint.toBase58();
      let tokenSymbol = "";
      let tokenLogo = "";

      if (metadataAccountInfo) {
        try {
          const token = await metaplex.nfts().findByMint({ mintAddress: mint });
          tokenName = token.name;
          tokenSymbol = token.symbol;
          tokenLogo = token.json?.image ? token.json.image : "";
        } catch (error) {
          console.error(
            `Failed to fetch metadata for mint: ${mint.toBase58()}`,
            error
          );
        }
      } else {
        const token = tokenMap.get(mint.toBase58());
        if (token) {
          tokenName = token.name;
          tokenSymbol = token.symbol;
          tokenLogo = token.logoURI;
        }
      }

      return {
        address: mint,
        name: tokenName,
        symbol: tokenSymbol,
        logo: tokenLogo,
      };
    })
  );

  return tokensData;
};
