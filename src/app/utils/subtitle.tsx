import { TokenListProvider, TokenInfo, ENV } from "@solana/spl-token-registry";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";
import { BN } from "@project-serum/anchor";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");


export const setSubtitle = (type: "create" | "take" | "close"):string => {
    switch (type) {
      case "create":
        return `Your escrow has been created! Please keep the escrow
                        address handy. It will be needed to close the escrow.
                        You can share it with your peer who wishes to withdraw
                        from the escrow. You can also choose to share a blink for easier trade`;

      case "take":
        return `Your withdrawl is complete and the escrow account has
                        been closed. Please check the details below.`;

      case "close":
        return `Your escrow has been closed and the funds have been
                        transferred back to the maker account.`;

      default:
        return "";
    }
  };

  //function to generate stars background
export const generateStars = (numStars: number) => {
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    const starStyle = {
      left: `${Math.random() * 100}vw`,
      top: `${Math.random() * 100}vh`,
      animationDelay: `${Math.random() * 10}s`,
      "--random-x": `${Math.random() - 0.5}`,
      "--random-y": `${Math.random() - 0.5}`,
    } as React.CSSProperties;
    stars.push(<div className="star" style={starStyle} key={i} />);
  }
  return stars;
};

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
          const token = await metaplex
            .nfts()
            .findByMint({ mintAddress: mint });
          tokenName = token.name;
          tokenSymbol = token.symbol;
          tokenLogo = token.json?.image? token.json.image : "";
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

export const getNonZeroBalanceTokens = async (mintAddresses: PublicKey[], key:PublicKey) => {

  const tokenAccounts = await connection.getTokenAccountsByOwner(key, {
    programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  });

  const nonZeroBalanceMintAddresses: PublicKey[] = [];

  for (const tokenAccount of tokenAccounts.value) {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    const mint = new PublicKey(accountData.mint);
    const balance = new BN(accountData.amount, 10, 'le').toNumber();
    // const balance = u64.fromBuffer(accountData.amount).toNumber();

    if (balance > 0 && mintAddresses.some((mintAddress) => mintAddress.equals(mint))) {
      nonZeroBalanceMintAddresses.push(mint);
    }
  }

  return nonZeroBalanceMintAddresses;
};