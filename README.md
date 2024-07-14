# This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Overview
This project, deployed on [Vercel](https://vercel.com), interacts with an Anchor smart contract deployed to the Solana devnet at address [7gW2yGMScBLiHhGPmFxjb83Vay6DrAtuP1BjjUct85ZX](https://explorer.solana.com/address/7gW2yGMScBLiHhGPmFxjb83Vay6DrAtuP1BjjUct85ZX?cluster=devnet). It was created for the Solana Talent Olympics.

### Features
- **Automatic Wallet Detection**: Integrated with automatic Phantom wallet detection on start instead of a wallet link button.
- **Escrow Creation**: Users select a token from a dropdown of tokens present in their Phantom wallet, specify the amount to transfer to the escrow, then select the token and amount they want in exchange. This process returns a transaction signature and the escrow address.
- **Withdraw**: Users enter the escrow address to view swap details. Upon acceptance, the swap completes, and the escrow account closes.
- **Close Escrow**: Users can close escrows created with their wallet address by entering the escrow address and signing with the same wallet address.

## Getting Started

 **Run Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   Open http://localhost:3000 with your browser to see the result

Project can be found at https://toekn.vercel.app




