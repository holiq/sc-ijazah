import { network, artifacts } from "hardhat";

/**
 * Script untuk deploy VerifikasiIjazah ke Sepolia Testnet
 *
 * Jalankan dengan: npx hardhat run scripts/deploy-sepolia.ts --network sepolia
 */

// Connect ke Sepolia
const { viem } = await network.connect({
  network: "sepolia",
  chainType: "l1",
});

console.log("=".repeat(60));
console.log("DEPLOYING TO SEPOLIA TESTNET");
console.log("=".repeat(60));

const publicClient = await viem.getPublicClient();
const [deployerClient] = await viem.getWalletClients();

console.log("\n📍 Deployer address:", deployerClient.account.address);

// Check balance
const balance = await publicClient.getBalance({
  address: deployerClient.account.address,
});
console.log(`💰 Balance: ${Number(balance) / 1e18} ETH`);

if (balance === 0n) {
  console.log("\n❌ ERROR: Tidak ada ETH untuk gas fee!");
  console.log("   Dapatkan test ETH dari: https://sepoliafaucet.com");
  process.exit(1);
}

console.log("\n📦 Deploying VerifikasiIjazah contract...");

// Get contract artifact
const artifact = await artifacts.readArtifact("VerifikasiIjazah");

// Deploy contract
const hash = await deployerClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode as `0x${string}`,
  args: [],
});

console.log(`📤 Transaction hash: ${hash}`);
console.log("⏳ Waiting for confirmation...");

// Wait for deployment
const receipt = await publicClient.waitForTransactionReceipt({ hash });

const contractAddress = receipt.contractAddress!;

console.log("\n" + "=".repeat(60));
console.log("✅ DEPLOYMENT SUCCESSFUL!");
console.log("=".repeat(60));
console.log(`\n📄 Contract Address: ${contractAddress}`);
console.log(
  `🔗 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`
);
console.log(`📤 TX: https://sepolia.etherscan.io/tx/${hash}`);
console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
console.log(`📦 Block: ${receipt.blockNumber}`);
