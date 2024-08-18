"use client";
import { motion } from "framer-motion";
import CreateEscrowForm from "../../components/CreateEscrowForm";
import { useEffect, useState } from "react";
import { PublicKey } from "@metaplex-foundation/js";
import { BN } from "@coral-xyz/anchor";
import { randomBytes } from "crypto";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createEscrow } from "../../solana/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { usePopup } from "@/app/hooks/use-popup";
import { containerVariants } from "@/app/constants/variants";
import { getNonZeroBalanceTokens } from "@/app/utils/getZeroBalanceTokens";
import { fetchTokenMetadata } from "@/app/utils/fetchTokenMetada";
import { TokenData } from "@/app/interfaces";

const Create = () => {
  //states
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [receiveMintAddress, setReceiveMintAddress] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<number>(1);
  const [amountToSend, setAmountToSend] = useState<number>(1);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [fetchingMints, setFetchingMints] = useState<boolean>(false);

  //constants
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  //hooks
  const wallet = useWallet();
  const { setShowPopup, setTxId, setType } = usePopup();

  //effect to fetch mint addresses on wallet connect
  useEffect(() => {
    if (wallet.publicKey) handleFetchMintAddresses();
  }, [wallet]);

  //function to get mint addresses
  const getMintAddresses = async (
    connection: Connection,
    walletPublicKey: PublicKey
  ) => {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { programId: TOKEN_PROGRAM_ID }
      );
      const mintAddresses = tokenAccounts.value.map(
        ({ account }) => new PublicKey(account.data.parsed.info.mint)
      );
      return mintAddresses;
    } catch (error: any) {
      toast.error(`Failed to fetch mint addresses ${error.message}`);
    }
  };

  //function to fetch token metadata
  const handleFetchMintAddresses = async () => {
    setFetchingMints(true);
    if (!wallet.publicKey) {
      setFetchingMints(false);
      toast.error("Please connect your wallet");
      return;
    }

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintAddresses = await getMintAddresses(connection, wallet.publicKey);

    if (!mintAddresses) {
      setFetchingMints(false);
      throw new Error("No mint addresses found");
    }
    try {
      const nonZeroBalanceMintAddresses = await getNonZeroBalanceTokens(
        mintAddresses,
        wallet.publicKey
      );

      if (nonZeroBalanceMintAddresses?.length === 0) {
        setFetchingMints(false);
        setTokens([]);
        return;
      }

      const data = await fetchTokenMetadata(nonZeroBalanceMintAddresses);
      setTokens(data.filter((token) => token.name)); // Only set tokens with a valid name
      setFetchingMints(false);
    } catch (e: any) {
      setFetchingMints(false);
      console.error("Error fetching mint addresses:", e);
      toast.error(`Error fetching mint addresses: ${e.message}`);
    }
  };

  //function to create escrow
  const handleCreateEscrow = async () => {
    if (!wallet.publicKey) return;
    setCreateLoading(true);

    try {
      if (!selectedToken) {
        toast.warn("Please select a token");
        return;
      }

      if (!receiveMintAddress) {
        toast.warn("Please enter a token mint");
        return;
      }
      const initMint = selectedToken.address;
      const mintB = new PublicKey(receiveMintAddress);
      const seed = new BN(randomBytes(8));
      const mintInfoA = await getMint(connection, initMint);
      const mintInfoB = await getMint(connection, mintB);

      const decimalsA = mintInfoA.decimals;
      const decimalsB = mintInfoB.decimals;

      const scaledAmount = amountToSend * 10 ** decimalsA;
      const scaledReceiveAmount = receiveAmount * 10 ** decimalsB;

      const FAKE_ESCROW = {
        mintA: initMint,
        mintB: mintB,
        maker: wallet.publicKey,
        address: wallet?.publicKey,
        deposit: scaledAmount,
        tokenNameA: "SendToekn",
        tokenNameB: "ReceiveToekn",
        expectedAmountToReceive: scaledReceiveAmount,
        isLoading: true,
      };

      mutate("ALL_ESCROWS", (escrows: any) => [FAKE_ESCROW, ...escrows], false);

      const data = await createEscrow(
        initMint,
        mintB,
        seed,
        scaledAmount,
        scaledReceiveAmount,
        wallet
      );

      if (data) {
        setTxId(data?.txId);
        setType("create");
        setShowPopup(true);
      }
    } catch (error: any) {
      console.error("Error creating escrow:", error);
      toast.error("Error creating escrow");
    } finally {
      mutate("ALL_ESCROWS");
      setCreateLoading(false);
      setSelectedToken(null);
      setAmountToSend(1);
      setReceiveMintAddress("");
      setReceiveAmount(1);
    }
  };

  //onchange function for token select
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value;
    const token = tokens.find(
      (token) => token.address.toBase58() === selectedAddress
    );
    setSelectedToken(token || null);
  };

  return (
    <main className="flex flex-col scroll-smooth gap-y-10 min-h-screen items-center ct-md:justify-center px-6 bg-transparent pt-[124px] ct-md:pt-[74px] relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        custom={1}
        className="flex flex-col gap-y-2 items-center text-toekn-white font-toekn-regular w-fit px-6 py-10 rounded-md bg-[#181c1e]"
      >
        <motion.p
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          custom={2}
          className="font-toekn-regular text-toekn-orange text-toekn-banner-header-mobile ct-md:text-toekn-banner-header mb-6"
        >
          Create an Escrow!
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          custom={3}
          className="w-full flex justify-center"
        >
          <CreateEscrowForm
            tokens={tokens}
            selectedToken={selectedToken}
            amountToSend={amountToSend}
            receiveMintAddress={receiveMintAddress}
            receiveAmount={receiveAmount}
            handleCreateEscrow={handleCreateEscrow}
            handleTokenChange={handleTokenChange}
            setAmountToSend={setAmountToSend}
            setReceiveMintAddress={setReceiveMintAddress}
            setReceiveAmount={setReceiveAmount}
            loading={createLoading}
            setLoading={setCreateLoading}
            fetchingMints={fetchingMints}
          />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Create;
