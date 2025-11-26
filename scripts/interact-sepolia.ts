import { network, artifacts } from "hardhat";
import { createHash } from "crypto";
import "dotenv/config";

/**
 * Script untuk berinteraksi dengan contract VerifikasiIjazah yang sudah di-deploy di Sepolia
 */

// Contract address dari environment variable
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`;

if (!CONTRACT_ADDRESS) {
  console.error("❌ CONTRACT_ADDRESS tidak ditemukan di .env");
  process.exit(1);
}

// Fungsi untuk generate hash SHA-256
function generateHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

// Connect ke Sepolia
const { viem } = await network.connect({
  network: "sepolia",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();
const artifact = await artifacts.readArtifact("VerifikasiIjazah");

console.log("=".repeat(60));
console.log("INTERAKSI DENGAN CONTRACT DI SEPOLIA TESTNET");
console.log("=".repeat(60));
console.log("\n📍 Wallet Address:", walletClient.account.address);
console.log("📄 Contract Address:", CONTRACT_ADDRESS);

// ============================================
// 1. MENAMBAHKAN IJAZAH BARU
// ============================================
console.log("\n" + "=".repeat(60));
console.log("1️⃣ MENAMBAHKAN DATA IJAZAH");
console.log("=".repeat(60));

const dataIjazah = {
  nim: "220320002",
  namaPemilik: "Holiq Ibrahim",
  prodi: "Informatika",
  tahunLulus: "2025",
  hashIjazah: generateHash("ijazah_holiq_ibrahim_220320002.pdf"),
};

console.log("\n📝 Data yang akan ditambahkan:");
console.log(`   NIM          : ${dataIjazah.nim}`);
console.log(`   Nama         : ${dataIjazah.namaPemilik}`);
console.log(`   Prodi        : ${dataIjazah.prodi}`);
console.log(`   Tahun Lulus  : ${dataIjazah.tahunLulus}`);
console.log(`   Hash         : ${dataIjazah.hashIjazah}`);

console.log("\n⏳ Mengirim transaksi ke blockchain...");

const txHash = await walletClient.writeContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: artifact.abi,
  functionName: "tambahIjazah",
  args: [
    dataIjazah.nim,
    dataIjazah.namaPemilik,
    dataIjazah.prodi,
    dataIjazah.tahunLulus,
    dataIjazah.hashIjazah,
  ],
});

console.log(`📤 TX Hash: ${txHash}`);
console.log("⏳ Menunggu konfirmasi...");

const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log(`✅ Transaksi dikonfirmasi di block: ${receipt.blockNumber}`);
console.log(`🔗 Lihat di Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);

// ============================================
// 2. MENGAMBIL DATA IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("2️⃣ MENGAMBIL DATA IJAZAH");
console.log("=".repeat(60));

const ijazahData = (await publicClient.readContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: artifact.abi,
  functionName: "getIjazah",
  args: [dataIjazah.nim],
})) as any;

console.log("\n📋 Data Ijazah dari Blockchain:");
console.log(`   Nama Pemilik  : ${ijazahData.namaPemilik}`);
console.log(`   NIM           : ${ijazahData.nim}`);
console.log(`   Program Studi : ${ijazahData.prodi}`);
console.log(`   Tahun Lulus   : ${ijazahData.tahunLulus}`);
console.log(`   Hash Ijazah   : ${ijazahData.hashIjazah}`);
console.log(
  `   Status        : ${ijazahData.valid ? "✅ VALID" : "❌ TIDAK VALID"}`
);

// ============================================
// 3. VERIFIKASI IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("3️⃣ VERIFIKASI IJAZAH");
console.log("=".repeat(60));

// Test dengan hash yang benar
console.log("\n🔐 Verifikasi dengan hash ASLI:");
const isValid = (await publicClient.readContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: artifact.abi,
  functionName: "verifikasiIjazah",
  args: [dataIjazah.nim, dataIjazah.hashIjazah],
})) as boolean;

console.log(
  `   Hasil: ${isValid ? "✅ IJAZAH VALID" : "❌ IJAZAH TIDAK VALID"}`
);

// Test dengan hash yang salah
console.log("\n🔐 Verifikasi dengan hash PALSU:");
const hashPalsu = generateHash("ijazah_palsu.pdf");
const isValidPalsu = (await publicClient.readContract({
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: artifact.abi,
  functionName: "verifikasiIjazah",
  args: [dataIjazah.nim, hashPalsu],
})) as boolean;

console.log(
  `   Hasil: ${
    isValidPalsu ? "✅ IJAZAH VALID" : "❌ IJAZAH PALSU/TIDAK VALID"
  }`
);

console.log("\n" + "=".repeat(60));
console.log("🎉 INTERAKSI SELESAI!");
console.log("=".repeat(60));
console.log(`\n🔗 Lihat contract di Etherscan:`);
console.log(`   https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
