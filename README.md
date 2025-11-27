<div align="center">

# 🎓 Sistem Verifikasi Ijazah Berbasis Blockchain

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.0-yellow?logo=hardhat)](https://hardhat.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Network-Sepolia-627EEA?logo=ethereum)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Smart contract untuk mengelola dan memverifikasi keaslian ijazah secara terdesentralisasi menggunakan teknologi blockchain Ethereum.**

[Demo](https://sepolia.etherscan.io/address/0xc95269aeb45e05d067e99f7c72cfd5e6c8e7d874) • [Dokumentasi](#-dokumentasi) • [Kontribusi](#-kontribusi)

</div>

---

## ✨ Fitur Utama

- 🔐 **Immutable Storage** — Data ijazah tersimpan permanen di blockchain
- ✅ **Verifikasi Instan** — Validasi keaslian ijazah dengan hash SHA-256
- 🌐 **Terdesentralisasi** — Tidak bergantung pada server tunggal
- 📱 **Web Interface** — Frontend modern dengan Next.js & Tailwind CSS
- 🔗 **Transparent** — Semua transaksi dapat diaudit di Etherscan

---

## 📋 Informasi Contract

| Item                 | Detail                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Network**          | Sepolia Testnet                                                                                       |
| **Contract Address** | `0xc95269aeb45e05d067e99f7c72cfd5e6c8e7d874`                                                          |
| **Solidity Version** | ^0.8.28                                                                                               |
| **Explorer**         | [Lihat di Etherscan](https://sepolia.etherscan.io/address/0xc95269aeb45e05d067e99f7c72cfd5e6c8e7d874) |

---

## 🛠️ Tech Stack

| Layer              | Technology                       |
| ------------------ | -------------------------------- |
| **Blockchain**     | Ethereum (Sepolia Testnet)       |
| **Smart Contract** | Solidity 0.8.28                  |
| **Development**    | Hardhat 3.0, Viem                |
| **Frontend**       | Next.js 16, React 19, TypeScript |
| **Styling**        | Tailwind CSS 4                   |
| **Web3**           | Ethers.js 6                      |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- Metamask wallet
- Sepolia ETH (dari [faucet](https://sepoliafaucet.com))

### 1️⃣ Clone & Install

```bash
git clone https://github.com/holiq/sc-ijazah.git
cd sc-ijazah

# Install smart contract dependencies

npm install

# Install frontend dependencies

cd frontend && npm install
```

### 2️⃣ Setup Environment

Buat file \`.env\` di root folder:

```env

# Ethereum Network

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/PROJECT_ID
SEPOLIA_PRIVATE_KEY=private_key
CONTRACT_ADDRESS=0x_contract_address  # lihat step 4

# Frontend (opsional, buat di /frontend/.env.local)

NEXT_PUBLIC_CONTRACT_ADDRESS=0x_contract_address  # lihat step 4
```

<details>
<summary>📖 Cara mendapatkan credentials</summary>

| Credential      | Cara Mendapatkan                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **RPC URL**     | Daftar di [Infura](https://infura.io)                                                              |
| **Private Key** | Metamask → Account Details → Export Private Key                                                    |
| **Test ETH**    | [Sepolia Faucet](https://sepoliafaucet.com) atau [Alchemy Faucet](https://www.alchemy.com/faucets) |

</details>

### 3️⃣ Compile & Test

```bash

# Compile smart contract

npx hardhat compile

# Jalankan unit test

npx hardhat test

# Test dengan coverage (opsional)

npx hardhat coverage
```

### 4️⃣ Deploy

```bash

# Deploy ke local network

npx hardhat run scripts/deploy.ts

# Deploy ke Sepolia Testnet

npx hardhat run scripts/deploy-sepolia.ts --network sepolia

# Tambahkan output "Contract Address:" ke .env
```

### 5️⃣ Run Frontend

```bash
cd frontend
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Project

```
sc-ijazah/
├── 📂 contracts/
│ └── VerifikasiIjazah.sol # Smart contract utama
├── 📂 scripts/
│ ├── deploy.ts # Deploy ke local network
│ ├── deploy-sepolia.ts # Deploy ke Sepolia
│ ├── interact.ts # Interaksi local
│ └── interact-sepolia.ts # Interaksi Sepolia
├── 📂 test/
│ └── VerifikasiIjazah.ts # Unit tests
├── 📂 frontend/
│ ├── 📂 app/ # Next.js App Router
│ │ ├── layout.tsx
│ │ ├── page.tsx
│ │ └── globals.css
│ └── 📂 lib/
│ └── contract.ts # Contract ABI & Address
├── 📂 artifacts/ # Compiled contracts
├── 📂 ignition/ # Hardhat Ignition modules
├── hardhat.config.ts # Hardhat configuration
├── package.json
└── README.md
```

---

## 🔄 Alur Verifikasi

```
┌──────────────────────────────────────────────────────────────────────┐
│ PROSES REGISTRASI │
├──────────────────────────────────────────────────────────────────────┤
│ │
│ 📄 Upload PDF ──▶ 🔐 Generate Hash ──▶ ⛓️ Simpan ke │
│ Ijazah (SHA-256) Blockchain │
│ │
└──────────────────────────────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ PROSES VERIFIKASI │
├──────────────────────────────────────────────────────────────────────┤
│ │
│ 📄 Upload PDF ──▶ 🔐 Generate Hash ──▶ 🔍 Bandingkan │
│ Ijazah (SHA-256) dengan Chain │
│ │ │
│ ▼ │
│ ✅ Valid / ❌ Invalid│
│ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Contoh Data

```json
{
  "namaPemilik": "Holiq Ibrahim",
  "nim": "220320002",
  "prodi": "Informatika",
  "tahunLulus": "2025",
  "hashIjazah": "368cf965f5808223bc0125f17c0759b829cd47036e47224bdadd756716825732",
  "valid": true
}
```

---

## 🧪 Testing

```bash

# Run all tests

npx hardhat test

# Run specific test file

npx hardhat test test/VerifikasiIjazah.ts

# Run with gas reporting

REPORT_GAS=true npx hardhat test

# Generate coverage report

npx hardhat coverage
```

---

## 🔗 Links

| Resource              | URL                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------- |
| 📜 **Smart Contract** | [Etherscan](https://sepolia.etherscan.io/address/0xc95269aeb45e05d067e99f7c72cfd5e6c8e7d874) |
| �� **Sepolia Faucet** | [sepoliafaucet.com](https://sepoliafaucet.com)                                               |
| 🔑 **Infura**         | [infura.io](https://infura.io)                                                               |
| 📖 **Hardhat Docs**   | [hardhat.org](https://hardhat.org/docs)                                                      |
| 📖 **Next.js Docs**   | [nextjs.org](https://nextjs.org/docs)                                                        |
