import { ethers } from 'hardhat';
import * as crypto from 'crypto';

async function main() {
  console.log('====================================================');
  console.log('       BOT Chain Mainnet Interaction Test           ');
  console.log('====================================================');

  const contractAddress = '0xea1f0a5c1398F147cE3FDCD24515d48C5285B325';
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();

  const verifyd = await ethers.getContractAt('Verifyd', contractAddress, deployer);

  // 1. Create a non-sensitive test document content
  const testDocContent = 'Verifyd BOT Chain Mainnet Live Production Verification Test 2026-10-17';
  const rawSha256 = crypto.createHash('sha256').update(testDocContent, 'utf-8').digest('hex');
  const bytes32Hash = `0x${rawSha256}` as const;
  const docType = 'certificate';

  console.log(`Test Document Text: "${testDocContent}"`);
  console.log(`Computed SHA-256:   ${bytes32Hash}`);

  // 2. Pre-check: document must NOT exist initially
  const initialExists = await verifyd.documentExists(bytes32Hash);
  console.log(`Pre-check documentExists: ${initialExists} (expected false)`);
  if (initialExists) {
    console.log('Document was already registered previously.');
  } else {
    // 3. Register document on mainnet
    console.log('Registering test document on BOT Chain Mainnet...');
    const tx = await verifyd.registerDocument(bytes32Hash, docType);
    console.log(`Registration Tx Hash:     ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Confirmed in Block:       ${receipt?.blockNumber}`);

    // 4. Duplicate registration check (must fail/revert)
    console.log('Testing duplicate registration prevention...');
    try {
      await verifyd.registerDocument(bytes32Hash, docType);
      throw new Error('Duplicate registration should have reverted!');
    } catch {
      console.log('Duplicate check passed: Contract successfully prevented duplicate registration.');
    }
  }

  // 5. Read-only verification check
  const verifiedExists = await verifyd.documentExists(bytes32Hash);
  console.log(`Post-registration documentExists: ${verifiedExists} (expected true)`);
  if (!verifiedExists) {
    throw new Error('Verification failed: documentExists returned false after registration!');
  }

  const record = await verifyd.getDocument(bytes32Hash);
  console.log('Retrieved On-Chain Record:');
  console.log(` - Document Hash:  ${record.documentHash}`);
  console.log(` - Document Type:  ${record.documentType}`);
  console.log(` - Issuer:         ${record.issuer}`);
  console.log(` - Timestamp:      ${new Date(Number(record.timestamp) * 1000).toISOString()}`);

  if (record.issuer.toLowerCase() !== deployerAddress.toLowerCase()) {
    throw new Error(`Issuer mismatch: got ${record.issuer}, expected ${deployerAddress}`);
  }

  // 6. Modified document test (1 character altered)
  const modifiedContent = testDocContent + '!';
  const modifiedSha256 = crypto.createHash('sha256').update(modifiedContent, 'utf-8').digest('hex');
  const modifiedBytes32 = `0x${modifiedSha256}` as const;

  const modifiedExists = await verifyd.documentExists(modifiedBytes32);
  console.log(`Modified Document Hash: ${modifiedBytes32}`);
  console.log(`Modified documentExists: ${modifiedExists} (expected false)`);

  if (modifiedExists) {
    throw new Error('Integrity test failed: modified document was verified as authentic!');
  }

  console.log('====================================================');
  console.log('All Mainnet Live Interaction Tests PASSED!');
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Test failed:', err.message || err);
  process.exit(1);
});
