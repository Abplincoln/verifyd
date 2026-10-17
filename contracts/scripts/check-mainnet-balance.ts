import { ethers, network } from 'hardhat';

async function main() {
  console.log('====================================================');
  console.log('       BOT Chain Mainnet Pre-Deployment Check       ');
  console.log('====================================================');

  const networkDetails = await ethers.provider.getNetwork();
  const chainId = Number(networkDetails.chainId);
  console.log(`Connected Network Name: ${network.name}`);
  console.log(`Connected Chain ID:     ${chainId}`);

  if (chainId !== 677) {
    throw new Error(`Connected chain ID ${chainId} is not 677 (BOT Chain Mainnet).`);
  }

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error('No deployment signer configured in contracts/.env');
  }

  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();
  console.log(`Deployer Wallet Address: ${deployerAddress}`);

  const balanceWei = await ethers.provider.getBalance(deployerAddress);
  const balanceBot = ethers.formatEther(balanceWei);
  console.log(`Deployer Mainnet Balance: ${balanceBot} BOT`);

  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? 1000000000n; // fallback 1 gwei
  console.log(`Current Gas Price:        ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);

  // Estimate deployment gas
  const factory = await ethers.getContractFactory('Verifyd', deployer);
  const deployTx = await factory.getDeployTransaction();
  let estimatedGas: bigint;
  try {
    estimatedGas = await ethers.provider.estimateGas(deployTx);
  } catch {
    estimatedGas = 1000000n; // safe upper bound
  }
  console.log(`Estimated Deployment Gas: ${estimatedGas.toString()} units`);

  const estimatedCostWei = estimatedGas * gasPrice;
  const estimatedCostBot = ethers.formatEther(estimatedCostWei);
  console.log(`Estimated Deployment Cost:${estimatedCostBot} BOT`);

  console.log('----------------------------------------------------');
  if (balanceWei < estimatedCostWei) {
    console.log('STATUS: INSUFFICIENT FUNDS on BOT Chain Mainnet.');
    console.log(`Required minimum: ~${estimatedCostBot} BOT`);
    console.log(`Available:        ${balanceBot} BOT`);
  } else {
    console.log('STATUS: SUFFICIENT FUNDS for deployment.');
  }
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Check failed:', err.message || err);
  process.exit(1);
});
