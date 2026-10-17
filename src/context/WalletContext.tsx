import React, {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  createWalletClient,
  custom,
  type WalletClient,
} from 'viem';
import { botChainMainnet, BOT_CHAIN_CONFIG } from '../lib/botchain';
import { WalletContext } from './walletContextDef';

const TARGET_CHAIN_ID_HEX = `0x${BOT_CHAIN_CONFIG.chainId.toString(16)}` as `0x${string}`;
const TARGET_CHAIN_ID = BOT_CHAIN_CONFIG.chainId;

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  // Derive injected EVM provider presence
  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setWalletClient(null);
    setError(null);
  }, []);

  // Update chain ID helper
  const updateChainId = useCallback((newChainIdHex: string | number) => {
    const parsed =
      typeof newChainIdHex === 'string'
        ? parseInt(newChainIdHex, 16)
        : Number(newChainIdHex);
    setChainId(parsed);
  }, []);

  // Setup event listeners for account or network changes in MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        const primaryAccount = accounts[0] as `0x${string}`;
        setAddress(primaryAccount);
        setError(null);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      updateChainId(newChainId);
    };

    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, updateChainId]);

  // Request network switch or add BOT Chain (Chain ID 677)
  const switchToTargetNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not detected. Please install MetaMask to switch networks.');
      return;
    }

    try {
      setError(null);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });
      setChainId(TARGET_CHAIN_ID);
    } catch (switchError: any) {
      // Error code 4902 indicates that the chain has not been added to MetaMask
      if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_ID_HEX,
                chainName: BOT_CHAIN_CONFIG.name,
                rpcUrls: [BOT_CHAIN_CONFIG.rpcUrl],
                nativeCurrency: {
                  name: BOT_CHAIN_CONFIG.currencySymbol,
                  symbol: BOT_CHAIN_CONFIG.currencySymbol,
                  decimals: 18,
                },
                blockExplorerUrls: [BOT_CHAIN_CONFIG.explorerUrl],
              },
            ],
          });
          setChainId(TARGET_CHAIN_ID);
        } catch (addError: any) {
          if (addError?.code === 4001) {
            setError('Network addition was rejected in your wallet.');
          } else {
            setError(addError?.message || `Failed to add ${BOT_CHAIN_CONFIG.name}.`);
          }
        }
      } else if (switchError?.code === 4001) {
        setError('Network switch was rejected in your wallet.');
      } else {
        setError(switchError?.message || `Failed to switch to ${BOT_CHAIN_CONFIG.name}.`);
      }
    }
  }, []);

  // Backwards-compatible alias for existing components
  const switchToBohrTestnet = switchToTargetNetwork;

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not detected. Please install MetaMask to connect.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 1. Request user accounts
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setError('No account returned from wallet.');
        setIsConnecting(false);
        return;
      }

      const activeAccount = accounts[0] as `0x${string}`;
      setAddress(activeAccount);

      // 2. Query current chain
      const currentChainHex = (await window.ethereum.request({
        method: 'eth_chainId',
      })) as string;
      const currentChain = parseInt(currentChainHex, 16);
      setChainId(currentChain);

      // 3. Initialize viem WalletClient
      const client = createWalletClient({
        account: activeAccount,
        chain: botChainMainnet,
        transport: custom(window.ethereum),
      });
      setWalletClient(client);

      // 4. If connected to a different network, notify user
      if (currentChain !== TARGET_CHAIN_ID) {
        setError(
          `Connected to Chain ID ${currentChain}. ${BOT_CHAIN_CONFIG.name} (Chain ID ${TARGET_CHAIN_ID}) is required.`
        );
      }
    } catch (err: any) {
      if (err?.code === 4001) {
        setError('Connection request was rejected by user.');
      } else {
        setError(err?.message || 'Failed to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const isConnected = Boolean(address);
  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnecting,
        isConnected,
        isCorrectNetwork,
        isMetaMaskInstalled,
        error,
        walletClient,
        connectWallet,
        disconnectWallet,
        switchToTargetNetwork,
        switchToBohrTestnet,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
