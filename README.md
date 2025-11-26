# 🎓 Sistem Verifikasi Ijazah Berbasis Blockchain

Smart contract Solidity untuk mengelola dan memverifikasi data ijazah secara terdesentralisasi di Ethereum Sepolia Testnet.

## 📋 Informasi Contract

| Item                 | Value                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Network**          | Sepolia Testnet                                                                                       |
| **Contract Address** | `0xdc4b5c8d191a341d9678757d6e81de35f18041b0`                                                          |
| **Explorer**         | [Lihat di Etherscan](https://sepolia.etherscan.io/address/0xdc4b5c8d191a341d9678757d6e81de35f18041b0) |

---

## 🚀 Step-by-Step Penggunaan

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup Environment

Buat file `.env` di root folder:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_PRIVATE_KEY=wallet_private_key
```

**Cara mendapatkan:**

- **RPC URL**: Daftar di [Infura](https://infura.io) atau [Alchemy](https://alchemy.com)
- **Private Key**: Export dari Metamask (Account Details → Export Private Key)
- **Test ETH**: Dapatkan dari [Sepolia Faucet](https://sepoliafaucet.com)

### 3️⃣ Compile Smart Contract

```bash
npx hardhat compile
```

### 4️⃣ Jalankan Unit Test

```bash
npx hardhat test
```

### 5️⃣ Deploy ke Sepolia Testnet

```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

**Output:**

```
✅ DEPLOYMENT SUCCESSFUL!
📄 Contract Address: 0x...  ← SIMPAN ADDRESS INI!
```

### 6️⃣ Update Contract Address

Buka `scripts/interact-sepolia.ts` dan ganti `CONTRACT_ADDRESS` dengan address hasil deploy:

```typescript
const CONTRACT_ADDRESS = "0x_ADDRESS_HASIL_DEPLOY";
```

### 7️⃣ Interaksi dengan Contract

```bash
npx hardhat run scripts/interact-sepolia.ts --network sepolia
```

---

## 📁 Struktur Project

```
nft-ijazah/
├── contracts/
│   └── VerifikasiIjazah.sol    # Smart contract utama
├── scripts/
│   ├── deploy.ts               # Deploy ke local
│   ├── deploy-sepolia.ts       # Deploy ke Sepolia
│   ├── interact.ts             # Interaksi local
│   └── interact-sepolia.ts     # Interaksi Sepolia
├── test/
│   └── VerifikasiIjazah.ts     # Unit tests
├── .env.example                # Environment variables
└── hardhat.config.ts           # Konfigurasi Hardhat
```

---

## 📝 Fungsi Smart Contract

| Fungsi                | Deskripsi                             |
| --------------------- | ------------------------------------- |
| `tambahIjazah()`      | Menambahkan data ijazah baru          |
| `verifikasiIjazah()`  | Memverifikasi ijazah dengan hash      |
| `getIjazah()`         | Mengambil data ijazah berdasarkan NIM |
| `isIjazahTerdaftar()` | Cek apakah NIM sudah terdaftar        |
| `invalidasiIjazah()`  | Menonaktifkan ijazah                  |

---

## 🔄 Alur Verifikasi Ijazah

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Upload Ijazah  │ ──▶ │  Generate Hash  │ ──▶ │ Simpan ke       │
│  (File PDF)     │     │  (SHA-256)      │     │ Blockchain      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Hasil:         │ ◀── │  Bandingkan     │ ◀── │ Verifikasi      │
│  Valid/Invalid  │     │  Hash           │     │ (Input Hash)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 📊 Contoh Data Ijazah

```
Nama Pemilik  : Holiq Ibrahim
NIM           : 220320002
Program Studi : Informatika
Tahun Lulus   : 2025
Hash Ijazah   : 368cf965f5808223bc0125f17c0759b829cd47036e47224bdadd756716825732
Status        : ✅ VALID
```

---

## 🔗 Link Penting

- **Contract**: https://sepolia.etherscan.io/address/0xdc4b5c8d191a341d9678757d6e81de35f18041b0
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Infura**: https://infura.io
- **Alchemy**: https://alchemy.com

---

## 📄 License
