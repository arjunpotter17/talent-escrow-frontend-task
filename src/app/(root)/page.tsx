"use client";
import { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import { createEscrow, refundEscrow, takeEscrow } from "../solana/solana";
import { Escrow, IDL } from "../solana/idl";
import { randomBytes } from "crypto";
import CreateEscrowForm from "../components/CreateEscrowForm";
import RedeemEscrowForm from "../components/RedeemEscrowForm";
import CloseEscrowForm from "../components/CloseEscrowForm";
import "../styles/stars.css";
import { CloseIcon } from "../components/CloseIcon/CloseIcon";
import { motion, AnimatePresence } from "framer-motion";
import { transition } from "../constants/transition";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Footer from "../components/Footer/page";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "../components/AppBar/page";

interface TokenData {
  address: PublicKey;
  name: string;
}

interface CreateEscrow {
  txId: string;
  escrow: string;
}

//function to generate stars background
const generateStars = (numStars: number) => {
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

const Home = () => {
  //hooks
  const wallet = useWallet();

  //consts
  const tokenProgram = TOKEN_PROGRAM_ID;
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const program = new Program<Escrow>(IDL, { connection });
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };
  const handleCopy = () => {
    alert("Link copied to clipboard!");
  };

  //states
  const [activeTab, setActiveTab] = useState<string>("Make");
  const [closeEscrowAddress, setCloseEscrowAddress] = useState<string>("");
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [amountToSend, setAmountToSend] = useState<number>(1);
  const [receiveMintAddress, setReceiveMintAddress] = useState<string>("");
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [redeemEscrowAddress, setRedeemEscrowAddress] = useState<string>("");
  const [escrowState, setEscrowState] = useState<any>(null);
  const [blinkEscrowState, setBlinkEscrowState] = useState<any>(null);
  const [createData, setCreateData] = useState<CreateEscrow>();
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [closeLoading, setCloseLoading] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [closeData, setCloseData] = useState<string>("");
  const [refundData, setRefundData] = useState<string>("");
  const [globalError, setGlobalError] = useState<string>("");
  const [blinkLink, setBlinkLink] = useState<string>("");

  //effect to fetch mint addresses on wallet connect
  useEffect(() => {
    if (wallet.publicKey) handleFetchMintAddresses();
  }, [wallet]);

  //effect to set bg
  useEffect(() => {
    setStars(generateStars(100));
  }, []);

  //effect to set blink
  useEffect(() => {
    if (blinkEscrowState) {
      setBlinkLink(
        `https://toekn.vercel.app/api/actions/withdraw?escrow=${createData?.escrow}&maker=${blinkEscrowState.maker}&mintA=${blinkEscrowState.mintA}&mintB=${blinkEscrowState.mintB}`
      );
    }
  }, [blinkEscrowState]);

  //function to create escrow
  const handleCreateEscrow = async () => {
    if (!wallet.publicKey) setGlobalError("Please connect your wallet");
    setCreateLoading(true);

    try {
      if (!selectedToken) throw new Error("No token selected");
      const initMint = selectedToken.address;
      const mintB = new PublicKey(receiveMintAddress);
      const seed = new BN(randomBytes(8));
      const mintInfoA = await getMint(connection, initMint);
      const mintInfoB = await getMint(connection, mintB);

      const decimalsA = mintInfoA.decimals;
      const decimalsB = mintInfoB.decimals;

      const scaledAmount = amountToSend * 10 ** decimalsA;
      const scaledReceiveAmount = receiveAmount * 10 ** decimalsB;

      const data = await createEscrow(
        initMint,
        mintB,
        seed,
        scaledAmount,
        scaledReceiveAmount,
        wallet
      );

      if (data) {
        setCreateData(data);
      }
    } catch (error: any) {
      console.error("Error creating escrow:", error);
      setGlobalError(`Error creating escrow: ${error.message}`);
    } finally {
      setCreateLoading(false);
      setSelectedToken(null);
      setAmountToSend(1);
      setReceiveMintAddress("");
      setReceiveAmount(0);
    }
  };

  //function to close escrow
  const handleCloseEscrow = async () => {
    if (!wallet.publicKey) setGlobalError("Please connect your wallet");
    setCloseLoading(true);
    try {
      if (!closeEscrowAddress) throw new Error("No escrow address provided");
      const data = await handleFetchEscrowState(
        closeEscrowAddress,
        false,
        true
      );
      if (!data) return;
      const makerAtaA = getAssociatedTokenAddressSync(
        data.mintA,
        data.maker,
        false,
        tokenProgram
      );
      const closeTxId = await refundEscrow(
        new PublicKey(closeEscrowAddress),
        data.mintA,
        makerAtaA,
        data.seed,
        wallet
      );
      if (closeTxId) setCloseData(closeTxId);
    } catch (error: any) {
      console.error("Error closing escrow:", error);
      setGlobalError(`Error closing escrow: ${error.message}`);
    } finally {
      setCloseLoading(false);
      setCloseEscrowAddress("");
    }
  };

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
      setGlobalError(`Failed to fetch mint addresses ${error.message}`);
    }
  };

  //function to fetch token metadata and display name instead of addresses
  const fetchTokenMetadata = async (mints: PublicKey[]) => {
    const tokenList = await new TokenListProvider().resolve();
    const tokenMap = tokenList.getList().reduce((map, token) => {
      map[token.address] = token;
      return map;
    }, {} as Record<string, TokenInfo>);

    const tokensData = mints.map((mint) => {
      const tokenInfo = tokenMap[mint.toBase58()];
      return {
        address: mint,
        name: tokenInfo ? tokenInfo.name : mint.toBase58(),
      };
    });

    setTokens(tokensData);
  };

  //function to fetch mint addresses
  const handleFetchMintAddresses = async () => {
    if (!wallet.publicKey) setGlobalError("Please connect your wallet");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletPublicKey = (window as any)?.solana.publicKey;
    const mintAddresses = await getMintAddresses(connection, walletPublicKey);
    if (!mintAddresses) {
      throw new Error("No mint addresses found");
    }
    await fetchTokenMetadata(mintAddresses);
  };

  //function to handle token change
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = e.target.value;
    const token = tokens.find(
      (token) => token.address.toBase58() === selectedAddress
    );
    setSelectedToken(token || null);
  };

  //function to fetch escrow state
  const handleFetchEscrowState = async (
    address: string,
    forBlink?: boolean,
    returns?: boolean
  ) => {
    setFetchLoading(true);
    try {
      const escrowAccount = await program.account.escrow.fetch(address);
      const vault = getAssociatedTokenAddressSync(
        escrowAccount.mintA,
        new PublicKey(address),
        true,
        TOKEN_PROGRAM_ID
      );
      const vaultAccountInfo = await connection.getParsedAccountInfo(vault);

      let tokenBalance = 0;
      if (vaultAccountInfo.value && "parsed" in vaultAccountInfo.value.data) {
        const parsedInfo = vaultAccountInfo.value.data;
        tokenBalance = parsedInfo.parsed.info.tokenAmount.uiAmount;
      }

      forBlink
        ? setBlinkEscrowState({
            ...escrowAccount,
            vaultAddress: vault.toBase58(),
            tokenBalance,
          })
        : setEscrowState({
            ...escrowAccount,
            vaultAddress: vault.toBase58(),
            tokenBalance,
          });
      return returns
        ? {
            ...escrowAccount,
            vaultAddress: vault.toBase58(),
            tokenBalance,
          }
        : null;
    } catch (error: any) {
      console.error("Error fetching escrow state:", error);
      setGlobalError(`Error fetching escrow state: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  //function to handle withdraw from escrow
  const handleWithdraw = async (blink?: boolean, address?: string) => {
    if (!wallet.publicKey) setGlobalError("Please connect your wallet");
    setWithdrawLoading(true);
    try {
      const refundTx = await takeEscrow(
        new PublicKey(address ? address : redeemEscrowAddress),
        escrowState.mintA,
        escrowState.mintB,
        escrowState.maker,
        wallet
      );
      if (refundTx) setRefundData(refundTx as any as string);
    } catch (e: any) {
      console.error("Error refunding escrow:", e);
      setGlobalError(`Error refunding escrow: ${e.message}`);
    } finally {
      setWithdrawLoading(false);
      setRedeemEscrowAddress("");
      setEscrowState(null);
    }
  };

  return stars ? (
    <main className="flex flex-col scroll-smooth gap-y-10 min-h-screen items-center justify-center p-6 bg-black relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        custom={0}
        className="stars"
      >
        {stars}
      </motion.div>
      <div className="flex flex-col gap-y-2 items-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          custom={1}
          className="text-toekn-orange text-toekn-banner-header font-toekn-light z-10"
        >
          Toekn.
        </motion.p>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          custom={2}
          className="text-toekn-white font-toekn-regular text-base"
        >
          Peer to Peer SPL token swap was never easier!
        </motion.p>
      </div>
      <div className="relative w-full max-w-4xl z-50">
        <Navbar />
      </div>
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-4xl bg-transparent border border-red-400 w-full text-white px-4 py-2 rounded shadow-md flex overflow-scroll"
          >
            <button
              className="absolute right-0 pr-2 bg-black z-30"
              onClick={() => setGlobalError("")}
            >
              <CloseIcon size="25" color="#A04000" />
            </button>
            <span className="text-base mr-4 font-toekn-regular">
              {globalError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        custom={3}
        className="relative w-full max-w-4xl shadow-lg rounded-lg overflow-hidden min-h-[450px] font-toekn-regular bg-transparent border border-toekn-white z-10 mb-[75px]"
      >
        <div className="flex justify-around gap-x-2 ct-md:gap-x-0 p-4 border-b border-toekn-white">
          <button
            className={`px-4 py-2 hover:bg-toekn-orange hover:text-white hover:border-toekn-orange text-toekn-subtitle-mobile ct-md:text-toekn-subtitle ${transition} ${
              activeTab === "Make"
                ? "bg-toekn-orange text-white"
                : "border border-toekn-white text-toekn-white"
            }`}
            onClick={() => {
              setActiveTab("Make");
              setCreateData(undefined);
              setBlinkEscrowState(undefined);
            }}
          >
            Create Escrow
          </button>
          <button
            className={`px-4 py-2 hover:bg-toekn-orange hover:text-white hover:border-toekn-orange text-toekn-subtitle-mobile ct-md:text-toekn-subtitle ${transition} ${
              activeTab === "Receive"
                ? "bg-toekn-orange text-white"
                : "border border-toekn-white text-toekn-white"
            }`}
            onClick={() => {
              setActiveTab("Receive");
              setEscrowState(null);
              setRefundData("");
            }}
          >
            Redeem Escrow
          </button>
          <button
            className={`px-4 py-2 hover:bg-toekn-orange hover:text-white hover:border-toekn-orange text-toekn-subtitle-mobile ct-md:text-toekn-subtitle ${transition} ${
              activeTab === "Close"
                ? "bg-toekn-orange text-white"
                : "border border-toekn-white text-toekn-white"
            }`}
            onClick={() => {
              setActiveTab("Close");
              setCloseData("");
            }}
          >
            Close Escrow
          </button>
        </div>
        <div className="p-6 min-h-[450px] w-full flex flex-col items-center">
          {activeTab === "Make" && (
            <>
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
                disabled={createData ? true : false}
              />
              <AnimatePresence>
                {createData && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col border border-toekn-white mt-5 p-3"
                  >
                    <button
                      onClick={() => {
                        setCreateData(undefined);
                        setBlinkEscrowState(undefined);
                      }}
                      className="self-end cursor-pointer"
                    >
                      <CloseIcon size="25" color="#A04000" />
                    </button>
                    <div className="w-full max-w-lg  mt-4 text-toekn-white font-bold font-toekn-regular ">
                      <p className="text-justify">
                        Your escrow has been created! Please keep the escrow
                        address handy. It will be needed to close the escrow.
                        You can share it with your peer who wishes to withdraw
                        from the escrow.
                      </p>
                      <p
                        className="text-toekn-orange hover:underline font-toekn-regular cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/tx/${createData?.txId}?cluster=devnet`,
                            "_blank"
                          )
                        }
                      >
                        View Transaction on Explorer
                      </p>

                      <p className="mt-2">
                        Escrow Address:{" "}
                        <span className="text-toekn-orange">
                          {createData?.escrow}
                        </span>
                      </p>
                      {!blinkLink ? (
                        <button
                          onClick={async () => {
                            await handleFetchEscrowState(
                              createData?.escrow as string,
                              true
                            );
                          }}
                          className="px-4 py-2 bg-toekn-orange hover:bg-toekn-dark-orange hover:text-white hover:border-toekn-orange mt-2"
                        >
                          Blink
                        </button>
                      ) : (
                        <div className="mt-2">
                          <div className="text-toekn-orange text-base font-toekn-regular text-justify">
                            {blinkLink.slice(0, 50)}...
                          </div>
                          <CopyToClipboard text={blinkLink} onCopy={handleCopy}>
                            <button className="px-2 py-1 bg-toekn-orange hover:bg-toekn-dark-orange hover:text-white hover:border-toekn-orange mt-2">
                              Copy Full Link
                            </button>
                          </CopyToClipboard>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          {activeTab === "Receive" && (
            <>
              <RedeemEscrowForm
                escrowAddress={redeemEscrowAddress}
                escrowState={escrowState}
                handleFetchEscrowState={handleFetchEscrowState}
                handleWithdraw={handleWithdraw}
                setEscrowAddress={setRedeemEscrowAddress}
                fetchLoading={fetchLoading}
                withdrawLoading={withdrawLoading}
              />
              <AnimatePresence>
                {refundData && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col border border-toekn-white mt-5 p-3"
                  >
                    <button
                      onClick={() => setRefundData("")}
                      className="self-end cursor-pointer"
                    >
                      <CloseIcon size="25" color="#A04000" />
                    </button>
                    <div className="w-full max-w-lg  mt-4 text-toekn-white font-bold font-toekn-regular ">
                      <p className="text-justify">
                        Your withdrawl is complete and the escrow account has
                        been closed. Please check the details below.
                      </p>
                      <p
                        className="text-toekn-orange hover:underline font-toekn-regular cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/tx/${refundData}?cluster=devnet`,
                            "_blank"
                          )
                        }
                      >
                        View Transaction on Explorer
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          {activeTab === "Close" && (
            <>
              <CloseEscrowForm
                escrowAddress={closeEscrowAddress}
                handleCloseEscrow={handleCloseEscrow}
                setEscrowAddress={setCloseEscrowAddress}
                loading={closeLoading}
              />
              <AnimatePresence>
                {closeData !== "" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col border border-toekn-white mt-5 p-3"
                  >
                    <button
                      onClick={() => setCloseData("")}
                      className="self-end cursor-pointer"
                    >
                      <CloseIcon size="25" color="#A04000" />
                    </button>
                    <div className="w-full max-w-lg  mt-4 text-toekn-white font-bold font-toekn-regular ">
                      <p className="text-justify">
                        Your escrow has been closed and the funds have been
                        transferred back to the maker account.
                      </p>
                      <p
                        className="text-toekn-orange hover:underline font-toekn-regular cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/tx/${closeData}?cluster=devnet`,
                            "_blank"
                          )
                        }
                      >
                        View Transaction on Explorer
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        custom={4}
        className="w-full absolute bottom-0 z-10"
      >
        <Footer />
      </motion.div>
    </main>
  ) : (
    <p>Fetching Toekn.</p>
  );
};

export default Home;
