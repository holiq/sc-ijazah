import { network, artifacts } from "hardhat";
import { getAddress } from "viem";

// Deploy VerifikasiIjazah contract ke local hardhat network
const { viem } = await network.connect({
  network: "hardhatMainnet",
  chainType: "l1",
});

console.log("Deploying VerifikasiIjazah contract...");

const publicClient = await viem.getPublicClient();
const [deployerClient] = await viem.getWalletClients();

console.log("Deployer address:", deployerClient.account.address);

// Get contract artifact
const artifact = await artifacts.readArtifact("VerifikasiIjazah");

// Deploy contract
const hash = await deployerClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode as `0x${string}`,
  args: [],
});

// Wait for deployment
const receipt = await publicClient.waitForTransactionReceipt({ hash });

const contractAddress = receipt.contractAddress!;
console.log(`VerifikasiIjazah deployed to: ${contractAddress}`);
console.log("Deployment completed!");
