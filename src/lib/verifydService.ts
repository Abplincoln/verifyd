import {
  createPublicClient,
  http,
  encodeFunctionData,
  type WalletClient,
  type Account,
} from 'viem';
import {
  botChainMainnet,
  BOT_CHAIN_CONFIG,
  VERIFYD_CONTRACT_ADDRESS,
  verifydAbi,
} from './botchain';
import type { RegisteredDocument } from '../types/document';

/**
 * Read-only public client for BOT Chain Mainnet.
 * Connects directly to https://rpc.botchain.ai without requiring a connected wallet.
 */
export const publicClient = createPublicClient({
  chain: botChainMainnet,
  transport: http(BOT_CHAIN_CONFIG.rpcUrl),
});

/**
 * Checks whether a document hash is registered on BOT Chain Bohr Testnet.
 * @param documentHash The 32-byte hex hash (e.g. 0x...) of the document.
 * @returns boolean indicating if the document exists in the Verifyd registry.
 */
export async function checkDocumentExists(
  documentHash: `0x${string}`
): Promise<boolean> {
  try {
    const exists = await publicClient.readContract({
      address: VERIFYD_CONTRACT_ADDRESS,
      abi: verifydAbi,
      functionName: 'documentExists',
      args: [documentHash],
    });
    return Boolean(exists);
  } catch (error) {
    console.error('Failed to query documentExists from Verifyd contract:', error);
    throw error;
  }
}

/**
 * Retrieves the full document registration record from the Verifyd contract.
 * @param documentHash The 32-byte hex hash of the document.
 * @returns RegisteredDocument object if found, or null if unregistered.
 */
export async function getRegisteredDocument(
  documentHash: `0x${string}`
): Promise<RegisteredDocument | null> {
  try {
    const doc = await publicClient.readContract({
      address: VERIFYD_CONTRACT_ADDRESS,
      abi: verifydAbi,
      functionName: 'getDocument',
      args: [documentHash],
    });

    return {
      documentHash: doc.documentHash,
      documentType: doc.documentType,
      issuer: doc.issuer,
      timestamp: doc.timestamp,
    };
  } catch (error: any) {
    // If contract reverted with DocumentNotFound or empty record, return null
    if (
      error?.message?.includes('DocumentNotFound') ||
      error?.data?.errorName === 'DocumentNotFound'
    ) {
      return null;
    }
    // Also check existence as fallback
    const exists = await checkDocumentExists(documentHash).catch(() => false);
    if (!exists) {
      return null;
    }
    throw error;
  }
}

/**
 * Encodes the registerDocument function call data for use in transactions.
 * @param documentHash The 32-byte hex hash of the document.
 * @param documentType The category/type string of the document.
 * @returns Encoded ABI transaction data.
 */
export function encodeRegisterDocumentData(
  documentHash: `0x${string}`,
  documentType: string
): `0x${string}` {
  return encodeFunctionData({
    abi: verifydAbi,
    functionName: 'registerDocument',
    args: [documentHash, documentType],
  });
}

/**
 * Submits a document registration transaction to BOT Chain using a connected wallet client.
 * (Will be called by the Issue Document flow once wallet connection is integrated).
 * @param walletClient Connected viem WalletClient.
 * @param account The sender account or address.
 * @param documentHash The 32-byte hex hash of the document.
 * @param documentType The category string of the document.
 * @returns Transaction hash.
 */
export async function registerDocumentOnChain(
  walletClient: WalletClient,
  account: Account | `0x${string}`,
  documentHash: `0x${string}`,
  documentType: string
): Promise<`0x${string}`> {
  const hash = await walletClient.writeContract({
    address: VERIFYD_CONTRACT_ADDRESS,
    abi: verifydAbi,
    functionName: 'registerDocument',
    args: [documentHash, documentType],
    account,
    chain: botChainMainnet,
  });

  return hash;
}

/**
 * Waits for a document registration transaction to be mined and confirmed on BOT Chain.
 * @param txHash The transaction hash to wait for.
 * @returns The confirmed transaction receipt.
 */
export async function waitForRegistrationConfirmation(txHash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({ hash: txHash });
}
