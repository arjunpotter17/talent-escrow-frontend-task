"use client";
import { containerVariants } from "@/app/constants/variants";
import { motion } from "framer-motion";

const About = () => {
  //about toekn page
  return (
    <>
      <main className="flex flex-col scroll-smooth gap-y-10 min-h-screen items-center p-6 bg-transparent pt-[74px] relative overflow-hidden">
        <div className="flex flex-col gap-y-2 items-center text-toekn-white font-toekn-regular">
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
          <div className="w-full max-w-5xl">
            <motion.p
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              custom={3}
              className="mt-5"
            >
              <span className="text-toekn-orange">Toekn</span> is an innovative
              SPL token swap escrow frontend on the Solana blockchain, enhanced
              with the speed and efficiency of Solana Blinks. Our platform
              offers users a seamless and secure way to create, manage, and
              participate in token swaps with complete control and transparency.
            </motion.p>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              custom={4}
              className="text-toekn-orange text-left w-full text-toekn-title mt-5"
            >
              Key Features
            </motion.p>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              custom={5}
              className="text-justify space-y-4 "
            >
              <motion.li
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                custom={6}
              >
                <span className="text-[#747f8b] mt-3">
                  Create Escrows for Any SPL Token:
                </span>{" "}
                Users can easily create escrows for any of their SPL tokens,
                setting up secure transactions without needing to rely on third
                parties. This flexibility allows users to swap a wide variety of
                tokens according to their needs.
              </motion.li>
              <motion.li
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                custom={7}
              >
                <span className="text-[#747f8b] mt-3">
                  Comprehensive Dashboard:
                </span>{" "}
                Access a detailed dashboard showcasing all active escrows. Users
                can view, manage, and redeem any escrow listed, providing a
                broad range of opportunities for secure token swaps within the
                community.
              </motion.li>
              <motion.li
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                custom={8}
              >
                <span className="text-[#747f8b] mt-3">
                  Redeem and Participate:
                </span>{" "}
                Users can redeem any escrow they find on the dashboard, provided
                they meet the conditions set by the creator. This feature
                enables users to actively participate in a dynamic and
                decentralized marketplace.
              </motion.li>
              <motion.li
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                custom={9}
              >
                <span className="text-[#747f8b] mt-3">
                  Cancel Escrows with Ease:
                </span>{" "}
                If an escrow hasn’t been redeemed yet, users have the freedom to
                cancel their escrow, providing flexibility and control over
                their transactions.
              </motion.li>
              <motion.li
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                custom={10}
              >
                <span className="text-[#747f8b] mt-3">
                  Powered by Solana Blinks:
                </span>{" "}
                Leveraging Solana Blinks, Toekn offers transaction flexibility
                and instant confirmation, ensuring a seamless and efficient user
                experience. The integration with Solana Blinks allows users to
                redeem escrows on other platforms that support the Blinks
                feature.
              </motion.li>
            </motion.ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default About;
