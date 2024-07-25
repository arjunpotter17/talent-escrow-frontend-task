import { PublicKey } from '@solana/web3.js';

export interface TokenData {
  address: PublicKey;
  name: string;
  symbol: string;
  logo: string;
}
