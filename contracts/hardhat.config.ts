import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from local contracts/.env or root .env if present
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rawPrivateKey = process.env.PRIVATE_KEY?.trim();
const privateKey = rawPrivateKey
  ? rawPrivateKey.startsWith('0x')
    ? rawPrivateKey
    : `0x${rawPrivateKey}`
  : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    bohrTestnet: {
      url: 'https://rpc.bohr.life',
      chainId: 968,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  etherscan: {
    customChains: [
      {
        network: 'bohrTestnet',
        chainId: 968,
        urls: {
          apiURL: 'https://scan.bohr.life/api',
          browserURL: 'https://scan.bohr.life',
        },
      },
    ],
  },
};

export default config;
