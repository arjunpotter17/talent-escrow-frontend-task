"use client"; //swr throws tantrums
import { useEscrows } from "../../solana/solana";
import OrderCard from "@/app/components/EscrowCard/page";
import Spinner from "@/app/components/Spinner/Spinner";
import { containerVariants } from "@/app/constants/variants";
import { motion } from "framer-motion";
import { Escrow } from "@/app/interfaces";

const Landing = () => {
  //hooks
  const { data: escrows, error: escrowsError, isLoading } = useEscrows();

  console.log(escrows);

  return (
    <main className="flex flex-col scroll-smooth gap-y-10 min-h-screen items-center p-6 bg-transparent pt-[74px] relative overflow-y-auto">
      <div className="flex w-full h-full flex-wrap gap-x-4 gap-y-4 max-w-6xl mt-10">
        {escrows ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            custom={1}
            className="flex flex-col gap-y-4 w-full"
          >
            <p className="font-toekn-regular text-toekn-title text-toekn-orange">
              Active Escrows
            </p>
            <div className="grid grid-cols-1 ct-lg:grid-cols-2 ct-xl:grid-cols-3 gap-x-10 gap-y-5 w-full mx-auto">
              {escrows?.map((escrow: Escrow, idx: number) => (
                <OrderCard key={idx} escrow={escrow} />
              ))}
            </div>
          </motion.div>
        ) : escrowsError ? (
          <p className="font-toekn-regular text-toekn-title text-toekn-white w-full text-center">
            Unable to fetch escrows at this moment
          </p>
        ) : isLoading ? (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <Spinner size={45} />
            <p className="font-toekn-regular text-toekn-subtitle-mobile ct-md:text-toekn-subtitle text-toekn-white text-center w-full">
              Fetching active escrows...
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Landing;
