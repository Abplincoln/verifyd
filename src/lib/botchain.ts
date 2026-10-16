import { defineChain } from 'viem';
import { verifydAbi } from './abi';

/**
 * BOT Chain Bohr Testnet configuration
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
export const VERIFYD_CONTRACT_ADDRESS = '0x2a0b615d605332D16ae915D4c8F405e239648074' as const;
export const VERIFYD_DEPLOYMENT_TX = '0x3e3d0e021272569c08a757e1e0468a4eba980fbfe78ce23f93b4e137a0038819' as const;

export const BOT_CHAIN_CONFIG = {
  name: 'BOT Chain Bohr Testnet',
  shortName: 'Bohr Testnet',
  chainId: 968,
  rpcUrl: 'https://rpc.bohr.life',
  explorerUrl: 'https://scan.bohr.life',
  explorerName: 'Bohr Scan',
  currencySymbol: 'BOT',
  contractAddress: VERIFYD_CONTRACT_ADDRESS,
  deploymentTransaction: VERIFYD_DEPLOYMENT_TX,
  isTestnet: true,
} as const;

export { verifydAbi };
