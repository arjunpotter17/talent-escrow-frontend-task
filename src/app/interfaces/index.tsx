import { PublicKey } from "@solana/web3.js";

export interface TokenData {
  address: PublicKey;
  name: string;
  symbol: string;
  logo: string;
}

export interface AmountInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export interface CreateEscrowFormProps {
  tokens: TokenData[];
  selectedToken: TokenData | null;
  amountToSend: number;
  receiveMintAddress: string;
  receiveAmount: number;
  loading: boolean;
  fetchingMints: boolean;
  setLoading: (value: boolean) => void;
  handleCreateEscrow: () => void;
  handleTokenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setAmountToSend: (value: number) => void;
  setReceiveMintAddress: (value: string) => void;
  setReceiveAmount: (value: number) => void;
}

export interface MintAddressFormProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export interface TokenDropdownProps {
  tokens: TokenData[];
  fetchingMints?: boolean;
  handleTokenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface CloseEscrowFormProps {
  escrowAddress: string;
  loading: boolean;
  handleCloseEscrow: () => void;
  setEscrowAddress: (address: string) => void;
}

export interface EscrowAddressInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface EscrowStateDetailsProps {
  escrowState: {
    mintAName: string;
    mintBName: string;
    mintA: PublicKey;
    mintB: PublicKey;
    tokenBalance: number;
    receive: any; // Adjust type as necessary
  };
  loading: boolean;
  handleWithdraw: () => void;
}

export interface RedeemEscrowFormProps {
  escrowAddress: string;
  escrowState: any;
  fetchLoading: boolean;
  withdrawLoading: boolean;
  handleFetchEscrowState: (address: string) => void;
  handleWithdraw: () => void;
  setEscrowAddress: (value: string) => void;
}

export interface TabButtonsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface PopupInterface {
  onClose: () => void;
  explorerLink: string;
  title: string;
  subTitle: string;
}
