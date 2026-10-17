import { createContext } from 'react';
import type { WalletClient } from 'viem';

export interface WalletContextType {
  address: `0x${string}` | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isMetaMaskInstalled: boolean;
  error: string | null;
  walletClient: WalletClient | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToTargetNetwork: () => Promise<void>;
  switchToBohrTestnet: () => Promise<void>;
  clearError: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);
