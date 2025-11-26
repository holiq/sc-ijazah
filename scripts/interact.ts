import { network, artifacts } from "hardhat";
import { createHash } from "crypto";

/**
 * Script untuk berinteraksi dengan smart contract VerifikasiIjazah
 *
 * Fungsi:
 * 1. Deploy contract
 * 2. Menambahkan ijazah
 * 3. Memverifikasi ijazah
 */

// Fungsi untuk generate hash SHA-256 (simulasi hash dari file PDF)
function generateHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

// Connect ke network
const { viem } = await network.connect({
  network: "hardhatMainnet",
  chainType: "l1",
});

const publicClient = await viem.getPublicClient();
const [walletClient] = await viem.getWalletClients();

console.log("=".repeat(60));
console.log("SISTEM VERIFIKASI IJAZAH BERBASIS BLOCKCHAIN");
console.log("=".repeat(60));
console.log("\n📍 Wallet Address:", walletClient.account.address);

// Deploy contract
console.log("\n📦 Deploying VerifikasiIjazah contract...");
const artifact = await artifacts.readArtifact("VerifikasiIjazah");

const deployHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode as `0x${string}`,
  args: [],
});

const receipt = await publicClient.waitForTransactionReceipt({
  hash: deployHash,
});
const contractAddress = receipt.contractAddress!;

console.log("✅ Contract deployed to:", contractAddress);

// Create contract instance
const verifikasiIjazah = {
  address: contractAddress,
  abi: artifact.abi,
};

// ============================================
// TAHAP 1: MENAMBAHKAN DATA IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("TAHAP 1: MENAMBAHKAN DATA IJAZAH");
console.log("=".repeat(60));

// Data ijazah sample (simulasi data dari database universitas)
const dataIjazahList = [
  {
    nim: "2021001",
    namaPemilik: "Ahmad Fauzi",
    prodi: "Teknik Informatika",
    tahunLulus: "2024",
    // Hash dari dokumen ijazah PDF (simulasi)
    hashIjazah: generateHash("ijazah_ahmad_fauzi_2021001_TI_2024.pdf"),
  },
  {
    nim: "2021002",
    namaPemilik: "Siti Nurhaliza",
    prodi: "Sistem Informasi",
    tahunLulus: "2024",
    hashIjazah: generateHash("ijazah_siti_nurhaliza_2021002_SI_2024.pdf"),
  },
  {
    nim: "2020003",
    namaPemilik: "Budi Santoso",
    prodi: "Teknik Elektro",
    tahunLulus: "2023",
    hashIjazah: generateHash("ijazah_budi_santoso_2020003_TE_2023.pdf"),
  },
];

// Tambahkan semua ijazah ke blockchain
for (const ijazah of dataIjazahList) {
  console.log(`\n📝 Menambahkan ijazah: ${ijazah.namaPemilik} (${ijazah.nim})`);

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "tambahIjazah",
    args: [
      ijazah.nim,
      ijazah.namaPemilik,
      ijazah.prodi,
      ijazah.tahunLulus,
      ijazah.hashIjazah,
    ],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`   ✅ Berhasil! TX: ${txHash.slice(0, 20)}...`);
  console.log(`   📄 Hash Ijazah: ${ijazah.hashIjazah.slice(0, 30)}...`);
}

// ============================================
// TAHAP 2: MENGAMBIL DATA IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("TAHAP 2: MENGAMBIL DATA IJAZAH");
console.log("=".repeat(60));

// Ambil data ijazah dari blockchain
const nimToCheck = "2021001";
console.log(`\n🔍 Mengambil data ijazah NIM: ${nimToCheck}`);

const dataIjazah = (await publicClient.readContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "getIjazah",
  args: [nimToCheck],
})) as any;

console.log("\n📋 Data Ijazah:");
console.log(`   Nama Pemilik  : ${dataIjazah.namaPemilik}`);
console.log(`   NIM           : ${dataIjazah.nim}`);
console.log(`   Program Studi : ${dataIjazah.prodi}`);
console.log(`   Tahun Lulus   : ${dataIjazah.tahunLulus}`);
console.log(`   Hash Ijazah   : ${dataIjazah.hashIjazah.slice(0, 30)}...`);
console.log(
  `   Status Valid  : ${dataIjazah.valid ? "✅ VALID" : "❌ TIDAK VALID"}`
);

// ============================================
// TAHAP 3: VERIFIKASI IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("TAHAP 3: VERIFIKASI IJAZAH");
console.log("=".repeat(60));

// Test Case 1: Verifikasi dengan hash yang benar (ijazah asli)
console.log("\n🔐 Test Case 1: Verifikasi ijazah ASLI");
const hashAsli = generateHash("ijazah_ahmad_fauzi_2021001_TI_2024.pdf");
const hasilVerifikasi1 = (await publicClient.readContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "verifikasiIjazah",
  args: [nimToCheck, hashAsli],
})) as boolean;

console.log(`   Input Hash: ${hashAsli.slice(0, 30)}...`);
console.log(
  `   Hasil     : ${
    hasilVerifikasi1 ? "✅ IJAZAH VALID" : "❌ IJAZAH TIDAK VALID"
  }`
);

// Test Case 2: Verifikasi dengan hash yang salah (ijazah palsu)
console.log("\n🔐 Test Case 2: Verifikasi ijazah PALSU (hash berbeda)");
const hashPalsu = generateHash("ijazah_palsu_dipalsukan.pdf");
const hasilVerifikasi2 = (await publicClient.readContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "verifikasiIjazah",
  args: [nimToCheck, hashPalsu],
})) as boolean;

console.log(`   Input Hash: ${hashPalsu.slice(0, 30)}...`);
console.log(
  `   Hasil     : ${
    hasilVerifikasi2 ? "✅ IJAZAH VALID" : "❌ IJAZAH TIDAK VALID (PALSU)"
  }`
);

// Test Case 3: Verifikasi NIM yang tidak terdaftar
console.log("\n🔐 Test Case 3: Verifikasi NIM yang TIDAK TERDAFTAR");
const nimTidakAda = "9999999";
const hasilVerifikasi3 = (await publicClient.readContract({
  address: contractAddress,
  abi: artifact.abi,
  functionName: "verifikasiIjazah",
  args: [nimTidakAda, hashAsli],
})) as boolean;

console.log(`   NIM       : ${nimTidakAda}`);
console.log(
  `   Hasil     : ${
    hasilVerifikasi3 ? "✅ IJAZAH VALID" : "❌ NIM TIDAK TERDAFTAR"
  }`
);

// ============================================
// TAHAP 4: CEK STATUS IJAZAH
// ============================================
console.log("\n" + "=".repeat(60));
console.log("TAHAP 4: CEK STATUS REGISTRASI IJAZAH");
console.log("=".repeat(60));

for (const ijazah of dataIjazahList) {
  const terdaftar = (await publicClient.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "isIjazahTerdaftar",
    args: [ijazah.nim],
  })) as boolean;

  console.log(
    `   ${ijazah.nim} (${ijazah.namaPemilik}): ${
      terdaftar ? "✅ Terdaftar" : "❌ Tidak Terdaftar"
    }`
  );
}

console.log("\n" + "=".repeat(60));
console.log("🎉 DEMO SELESAI!");
console.log("=".repeat(60));
console.log("\nContract Address:", contractAddress);
console.log("Network: Hardhat Local Network");
