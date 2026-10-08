import { ethers, network } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('====================================================');
  console.log('       Verifyd Smart Contract Deployment            ');
  console.log('====================================================');

  // 1. Verify network and Chain ID
  const networkDetails = await ethers.provider.getNetwork();
  const currentChainId = Number(networkDetails.chainId);

  console.log(`Connected Network Name: ${network.name}`);
  console.log(`Connected Chain ID:     ${currentChainId}`);

  if (currentChainId !== 968) {
    throw new Error(
      `Deployment aborted: Connected chain ID is ${currentChainId}, expected 968 (BOT Chain Bohr Testnet).`
    );
  }

  // 2. Check deployment account / signer
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      'Deployment aborted: No deployment account configured. Please set the PRIVATE_KEY environment variable.'
    );
  }

  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  console.log(`Deployment Wallet:      ${deployerAddress}`);

  // 3. Safeguard: Check if deployment already exists
  const deploymentsDir = path.resolve(__dirname, '../deployments');
  const recordPath = path.join(deploymentsDir, 'bohr-testnet.json');
  if (fs.existsSync(recordPath)) {
    const existing = JSON.parse(fs.readFileSync(recordPath, 'utf-8'));
    if (existing.contractAddress) {
      const existingCode = await ethers.provider.getCode(existing.contractAddress);
      if (existingCode && existingCode !== '0x' && existingCode !== '0x0') {
        console.log('----------------------------------------------------');
        console.log('Contract already successfully deployed!');
        console.log(`Contract Address:       ${existing.contractAddress}`);
        console.log(`Deployment Tx Hash:     ${existing.deploymentTransaction}`);
        console.log(`Explorer Link:          https://scan.bohr.life/address/${existing.contractAddress}`);
        console.log('----------------------------------------------------');
        return;
      }
    }
  }

  // 4. Check wallet balance
  const balanceBefore = await ethers.provider.getBalance(deployerAddress);
  const balanceBeforeFormatted = ethers.formatEther(balanceBefore);
  console.log(`Wallet Balance Before:  ${balanceBeforeFormatted} BOT`);

  // Minimum required balance estimate for contract deployment (typically ~0.001 BOT)
  const minRequiredBalance = ethers.parseEther('0.001');
  if (balanceBefore < minRequiredBalance) {
    console.error('----------------------------------------------------');
    console.error('INSUFFICIENT FUNDS ERROR:');
    console.error(`Wallet Address: ${deployerAddress}`);
    console.error(`Current Balance: ${balanceBeforeFormatted} BOT`);
    console.error('The deployment wallet does not have enough test BOT to cover gas fees.');
    console.error('Please request test BOT from the official BOT Chain faucet before deploying.');
    console.error('----------------------------------------------------');
    process.exit(1);
  }

  // 5. Deploy contract
  console.log('----------------------------------------------------');
  console.log('Deploying Verifyd.sol to Bohr Testnet...');
  const VerifydFactory = await ethers.getContractFactory('Verifyd', deployer);
  const verifyd = await VerifydFactory.deploy();

  console.log('Waiting for deployment transaction confirmation...');
  await verifyd.waitForDeployment();

  const contractAddress = await verifyd.getAddress();
  const deploymentTx = verifyd.deploymentTransaction();
  const txHash = deploymentTx ? deploymentTx.hash : 'N/A';

  console.log(`Contract Deployed At:   ${contractAddress}`);
  console.log(`Deployment Tx Hash:     ${txHash}`);

  // 6. Verify contract code exists on-chain via RPC
  console.log('Verifying on-chain contract code via RPC...');
  const deployedBytecode = await ethers.provider.getCode(contractAddress);
  if (!deployedBytecode || deployedBytecode === '0x' || deployedBytecode === '0x0') {
    throw new Error(
      `Deployment verification failed: No contract bytecode found at ${contractAddress}`
    );
  }
  console.log('Contract bytecode successfully verified on-chain.');

  // 7. Check balance after deployment
  const balanceAfter = await ethers.provider.getBalance(deployerAddress);
  const balanceAfterFormatted = ethers.formatEther(balanceAfter);
  console.log(`Wallet Balance After:   ${balanceAfterFormatted} BOT`);

  // 8. Write deployment record
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentRecord = {
    network: 'BOT Chain Bohr Testnet',
    chainId: 968,
    rpcUrl: 'https://rpc.bohr.life',
    explorerUrl: 'https://scan.bohr.life',
    contractName: 'Verifyd',
    contractAddress: contractAddress,
    deploymentTransaction: txHash,
    deployedAt: new Date().toISOString(),
    deployerAddress: deployerAddress,
  };

  fs.writeFileSync(recordPath, JSON.stringify(deploymentRecord, null, 2), 'utf-8');
  console.log(`Deployment record saved to: ${recordPath}`);
  console.log('====================================================');
  console.log('Deployment completed successfully!');
  console.log(`Explorer Link: https://scan.bohr.life/address/${contractAddress}`);
  console.log('====================================================');
}

main().catch((error) => {
  console.error('Deployment execution failed:', error.message || error);
  process.exit(1);
});
