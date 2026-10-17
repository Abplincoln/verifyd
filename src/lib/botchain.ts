import { defineChain } from 'viem';
import { verifydAbi } from './abi';

/**
 * BOT Chain Mainnet configuration
 * Chain ID: 677
 * RPC: https://rpc.botchain.ai
 * Explorer: https://scan.botchain.ai
 * Native token: BOT
 */
export const botChainMainnet = defineChain({
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Botscan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});

/**
 * BOT Chain Bohr Testnet configuration (preserved for development/testing)
 * Chain ID: 968
 * RPC: https://rpc.bohr.life
 * Explorer: https://scan.bohr.life
 * Native token: BOT
 */
export const botChainBohrTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Bohr Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bohr Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

/**
 * Deployed Verifyd Smart Contract Details
 */
export const VERIFYD_MAINNET_CONTRACT_ADDRESS = '0xea1f0a5c1398F147cE3FDCD24515d48C5285B325' as const;
export const VERIFYD_MAINNET_DEPLOYMENT_TX = '0xdde477ad9f3d2d6d6d0947f64f12ff7b8ede7be346e81d77a4d6cb50b648a049' as const;

export const VERIFYD_TESTNET_CONTRACT_ADDRESS = '0x2a0b615d605332D16ae915D4c8F405e239648074' as const;
export const VERIFYD_TESTNET_DEPLOYMENT_TX = '0x3e3d0e021272569c08a757e1e0468a4eba980fbfe78ce23f93b4e137a0038819' as const;

// Production target: BOT Chain Mainnet
export const VERIFYD_CONTRACT_ADDRESS = VERIFYD_MAINNET_CONTRACT_ADDRESS;
export const VERIFYD_DEPLOYMENT_TX = VERIFYD_MAINNET_DEPLOYMENT_TX;

export const BOT_CHAIN_CONFIG = {
  name: 'BOT Chain Mainnet',
  shortName: 'BOT Chain',
  chainId: 677,
  rpcUrl: 'https://rpc.botchain.ai',
  explorerUrl: 'https://scan.botchain.ai',
  explorerName: 'Botscan',
  currencySymbol: 'BOT',
  contractAddress: VERIFYD_MAINNET_CONTRACT_ADDRESS,
  deploymentTransaction: VERIFYD_MAINNET_DEPLOYMENT_TX,
  isTestnet: false,
} as const;

export { verifydAbi };
