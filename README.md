# Verifyd

> **Verify what you can prove.**

Verifyd is a blockchain-based document verification MVP built on BOT Chain.

It creates a cryptographic SHA-256 fingerprint of a document directly in the user's browser and records that fingerprint on-chain. Anyone can later verify the authenticity of the exact same document without uploading the file to any server or connecting a Web3 wallet.

---

## How It Works

### Flow 1: Issue Document (Issuer)
1. **Select Document**: The issuer selects or drops a document (PDF, image, certificate, etc.).
2. **Local Hashing**: The browser computes the 256-bit SHA-256 digest in memory via the Web Crypto API.
3. **Register on BOT Chain**: The issuer connects their wallet and submits the fingerprint and document type to the Verifyd smart contract on BOT Chain Bohr Testnet.
4. **Permanent Anchor**: The transaction is confirmed and permanently anchored on-chain. The original document is **never** uploaded or stored anywhere.

### Flow 2: Verify Document (Verifier)
1. **Select Document**: A verifier drops any copy of the document to inspect.
2. **Local Hashing**: The browser calculates its SHA-256 digest locally in memory.
3. **On-Chain Lookup**: Verifyd queries the deployed smart contract using the public BOT Chain RPC.
4. **Instant Verification**:
   - **Matching Hash found**: Status displays **VERIFIED** alongside registration metadata (issuer address, document type, timestamp).
   - **No matching Hash found**: Status displays **NOT VERIFIED**, indicating the document was altered, modified, or never registered.

---

## Privacy Model

* **Zero File Uploads**: Documents remain strictly in the user's local browser memory.
* **No On-Chain Document Storage**: The actual file content is never stored on-chain or on any server.
* **Cryptographic Fingerprints Only**: Only the irreversible 32-byte SHA-256 hash, document category, issuer address, and block timestamp are recorded.
* **Public & Gas-Free Verification**: Checking document authenticity is completely read-only (`eth_call`). Verifiers do not need MetaMask, a wallet connection, or gas tokens.

---

## BOT Chain Deployment

Verifyd is deployed and verified on the official **BOT Chain Bohr Testnet**:

* **Network**: BOT Chain Bohr Testnet
* **Chain ID**: `968`
* **RPC URL**: `https://rpc.bohr.life`
* **Block Explorer**: `https://scan.bohr.life`
* **Contract Address**: [`0x2a0b615d605332D16ae915D4c8F405e239648074`](https://scan.bohr.life/address/0x2a0b615d605332D16ae915D4c8F405e239648074)
* **Deployment Transaction**: [`0x3e3d0e021272569c08a757e1e0468a4eba980fbfe78ce23f93b4e137a0038819`](https://scan.bohr.life/tx/0x3e3d0e021272569c08a757e1e0468a4eba980fbfe78ce23f93b4e137a0038819)

---

## Main Contract Functions

The `Verifyd.sol` smart contract exposes three minimal, permissionless functions:

* `registerDocument(bytes32 documentHash, string calldata documentType)`:  
  Records a new document hash with the sender address as issuer and current block timestamp. Reverts if the hash is zero, document type is empty, or if the hash has already been registered.
* `documentExists(bytes32 documentHash) external view returns (bool)`:  
  Returns `true` if the document hash is registered in the contract, otherwise `false`.
* `getDocument(bytes32 documentHash) external view returns (Document memory)`:  
  Returns the stored document record (`documentHash`, `documentType`, `issuer`, `timestamp`). Reverts with `DocumentNotFound()` if unregistered.

---

## Local Development

### Frontend Application (Root Directory)

Install dependencies:
```bash
npm install
```

Start local development server:
```bash
npm run dev
```
*(Runs Vite development server at `http://localhost:5173`)*

Build production assets:
```bash
npm run build
```

Run code linter:
```bash
npm run lint
```

### Smart Contracts (`contracts/` Directory)

Navigate to contracts folder:
```bash
cd contracts
npm install
```

Run the unit test suite (14 passing tests):
```bash
npx hardhat test
```

Compile the contract:
```bash
npx hardhat compile
```

Deploy to BOT Chain Bohr Testnet (requires `PRIVATE_KEY` in environment):
```bash
npx hardhat run scripts/deploy.ts --network bohrTestnet
```

---

## Project Structure

```
verifyd/
├── README.md                      # Project documentation and specifications
├── index.html                     # HTML root entrypoint
├── package.json                   # Frontend dependencies (React, Vite, viem, Tailwind)
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite bundler configuration
├── src/                           # Frontend source code
│   ├── App.tsx                    # Top-level application layout
│   ├── components/                # Reusable UI components
│   │   ├── Badge.tsx              # Status and tag badges
│   │   ├── Button.tsx             # Action buttons with loading states
│   │   ├── DocumentHashCard.tsx   # SHA-256 fingerprint display & copy
│   │   ├── FileUpload.tsx         # Drag & drop file upload zone
│   │   ├── Footer.tsx             # Footer with network & privacy notices
│   │   ├── Navbar.tsx             # Navigation header
│   │   └── WalletButton.tsx       # MetaMask connection & network switcher
│   ├── context/                   # Wallet connection state provider
│   ├── hooks/                     # Custom React hooks (useWallet)
│   ├── lib/                       # Web3 & blockchain integration
│   │   ├── abi.ts                 # Typed Verifyd contract ABI
│   │   ├── botchain.ts            # Bohr Testnet chain parameters & address
│   │   └── verifydService.ts      # viem client service for read & write calls
│   ├── pages/                     # Main user flows
│   │   ├── HomePage.tsx           # Product overview and entry points
│   │   ├── IssueDocumentPage.tsx  # Flow 1: Hash, classify, and register
│   │   └── VerifyDocumentPage.tsx # Flow 2: Read-only verification
│   ├── types/                     # TypeScript types and interfaces
│   └── utils/                     # Cryptography (SHA-256) and formatters
└── contracts/                     # Smart contract project
    ├── contracts/
    │   └── Verifyd.sol            # Core minimal Solidity verification contract
    ├── deployments/
    │   └── bohr-testnet.json      # Public on-chain deployment record
    ├── scripts/
    │   └── deploy.ts              # Idempotent Hardhat deployment script
    ├── test/
    │   └── Verifyd.ts             # Complete contract unit test suite (14 tests)
    ├── hardhat.config.ts          # Hardhat configuration for Bohr Testnet
    └── package.json               # Contract development dependencies
```

---

## MVP Scope

Verifyd is intentionally designed as a minimal, secure, and production-ready MVP:
* **Scope**: In-browser document hashing (SHA-256), wallet-connected on-chain registration on BOT Chain Bohr Testnet, and public read-only verification.
* **Exclusions**: Outside the MVP scope and intentionally not included: DIDs, Verifiable Credentials, NFTs, IPFS, user authentication, organization dashboards, document storage/encryption, credential revocation, admin panels, payment systems, or DAO governance.
