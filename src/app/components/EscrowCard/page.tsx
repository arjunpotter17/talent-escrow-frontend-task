"use client";
import { motion, AnimatePresence } from "framer-motion";
import handleCloseEscrow from "@/app/utils/closeEscrow";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Spinner from "../Spinner/Spinner";
import { usePopup } from "@/app/hooks/use-popup";
import truncateWallet from "@/app/utils/truncate";
import CopyToClipboard from "react-copy-to-clipboard";
import handleWithdraw from "@/app/utils/withdrawEscrow";
import { toast } from "react-toastify";
import { useWindowSize } from "@/app/hooks/use-weindowSize";
import { mutate } from "swr";
import ShareIcon from "../Icons/shareIcon"
import { Escrow } from "@/app/interfaces";

export default function OrderCard({ escrow }: { escrow: Escrow }) {
  const wallet = useWallet();
  const windowSize = useWindowSize()[0];
  const isMobile = windowSize < 768; // Assuming 768px is the mobile breakpoint
  const [loader, setLoader] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { setShowPopup, setTxId, setType } = usePopup();

  //handle close escrow or withdraw
  const handleClick = async () => {
    if (!wallet?.publicKey) {
      toast.warn("Please connect your wallet");
      return;
    }
    setLoader(true);
    try {
      const data =
        escrow?.maker.toBase58() == wallet?.publicKey?.toBase58()
          ? await handleCloseEscrow(escrow?.address?.toBase58(), wallet)
          : await handleWithdraw(escrow?.address?.toBase58(), wallet);

      if (!data) return;

      setTxId(data);
      setType(
        escrow?.maker.toBase58() == wallet?.publicKey?.toBase58()
          ? "close"
          : "take"
      );
      mutate("ALL_ESCROWS");
      setShowPopup(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
    }
  };

  //render toast for copy
  const handleCopy = () => {
    toast.success("Link copied to clipboard!");
  };

  //handle card click for mobile
  const handleCardClick = () => {
    if (isMobile) {
      setIsHovered((prev) => !prev);
    }
  };

  return (
    <motion.div
      className="rounded text-[#747f8b] bg-[#181c1e] opacity-[0.9] hover:opacity-100 cursor-pointer font-toekn-regular ct-md:min-w-[357px] px-3 relative"
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      onHoverStart={() => !isMobile && setIsHovered(true)}
      onHoverEnd={() => !isMobile && setIsHovered(false)}
      onClick={handleCardClick}
    >
      {escrow.isLoading && (
        <div className="rounded w-full h-full flex flex-col items-center justify-center absolute left-0 top-0 bg-toekn-popup-bg opacity-80">
          <Spinner size={30} color="#fff" />
          <p className="font-toekn-regular text-toekn-white text-base mb-8">
            This Escrow is undergoing mutation
          </p>
        </div>
      )}
      {!escrow.isLoading && (
        <p className="py-2 text-[20px] font-toekn-semibold text-toekn-white w-full overflow-x-scroll text-nowrap">
          {escrow.tokenNameB} for {escrow.tokenNameA}
        </p>
      )}
      <div className="pt-5 flex justify-between">
        <p>Escrow Address:</p>{" "}
        <CopyToClipboard text={escrow?.address.toBase58()} onCopy={handleCopy}>
          <p className="hover:cursor-pointer hover:underline">
            {truncateWallet(escrow?.address.toBase58(), 12, true)}
          </p>
        </CopyToClipboard>
      </div>
      <div className="flex justify-between">
        <p>Escrow Maker:</p>{" "}
        <CopyToClipboard text={escrow?.maker.toBase58()} onCopy={handleCopy}>
          <p className="hover:cursor-pointer hover:underline">
            {truncateWallet(escrow?.maker.toBase58(), 12, true)}
          </p>
        </CopyToClipboard>
      </div>
      {!escrow.isLoading && (
        <div className="flex justify-between">
          <p>Amount held:</p>
          <p className="text-[#92f7cb]">
            {escrow?.deposit} {escrow?.tokenNameA}
          </p>
        </div>
      )}
      {!escrow.isLoading && (
        <div className="pb-16 flex justify-between">
          <p>Swap amount:</p>
          <p className="text-[#ff8aad]">
            {escrow?.expectedAmountToReceive} {escrow?.tokenNameB}
          </p>
        </div>
      )}

      <AnimatePresence>
        {(isHovered || isMobile) && !escrow.isLoading && (
          <motion.div
            className="w-full absolute bottom-0 left-0 px-4 py-5 flex justify-between items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 2 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleClick}
              className="rounded-sm bg-toekn-orange text-toekn-dark-white hover:bg-toekn-dark-orange px-4 py-1 min-w-[100px]"
            >
              {loader ? (
                <Spinner size={25} color="#fff" />
              ) : escrow?.maker.toBase58() == wallet?.publicKey?.toBase58() ? (
                "Close"
              ) : (
                "Swap"
              )}
            </button>
            <CopyToClipboard
              onCopy={handleCopy}
              text={`https://toekn.vercel.app/api/actions/withdraw?escrow=${escrow?.address}&maker=${escrow?.maker}&mintA=${escrow?.mintA}&mintB=${escrow?.mintB}`}
            >
              <button className="rounded-sm bg-toekn-orange hover:bg-toekn-dark-orange px-2 py-1">
                <ShareIcon />
              </button>
            </CopyToClipboard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
