"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID } from "@/lib/contract";

interface Ijazah {
  namaPemilik: string;
  nim: string;
  prodi: string;
  tahunLulus: string;
  hashIjazah: string;
  valid: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"tambah" | "verifikasi" | "cari">("verifikasi");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Form states
  const [formTambah, setFormTambah] = useState({
    nim: "",
    nama: "",
    prodi: "",
    tahunLulus: "",
  });
  const [fileTambah, setFileTambah] = useState<File | null>(null);

  const [formVerifikasi, setFormVerifikasi] = useState({ nim: "" });
  const [fileVerifikasi, setFileVerifikasi] = useState<File | null>(null);
  const [verifikasiResult, setVerifikasiResult] = useState<boolean | null>(null);

  const [formCari, setFormCari] = useState({ nim: "" });
  const [ijazahData, setIjazahData] = useState<Ijazah | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setMessage({ type: "error", text: "Metamask tidak terinstall! Silakan install Metamask." });
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      
      // Switch to Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: unknown) {
        const error = switchError as { code: number };
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            }],
          });
        }
      }

      setAccount(accounts[0]);
      setIsConnected(true);
      setMessage({ type: "success", text: "Wallet terhubung!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Gagal menghubungkan wallet" });
    } finally {
      setLoading(false);
    }
  };

  // Generate SHA-256 hash from file
  const generateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Get contract instance
  const getContract = async (needSigner = false) => {
    const provider = new BrowserProvider(window.ethereum!);
    if (needSigner) {
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  };

  // Tambah Ijazah
  const handleTambahIjazah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTambah) {
      setMessage({ type: "error", text: "Pilih file ijazah PDF!" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "info", text: "Generating hash & mengirim transaksi..." });

      const hash = await generateHash(fileTambah);
      const contract = await getContract(true);

      const tx = await contract.tambahIjazah(
        formTambah.nim,
        formTambah.nama,
        formTambah.prodi,
        formTambah.tahunLulus,
        hash
      );

      setMessage({ type: "info", text: "Menunggu konfirmasi blockchain..." });
      await tx.wait();

      setMessage({ type: "success", text: `Ijazah berhasil ditambahkan! Hash: ${hash.slice(0, 20)}...` });
      setFormTambah({ nim: "", nama: "", prodi: "", tahunLulus: "" });
      setFileTambah(null);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Gagal menambahkan ijazah" });
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi Ijazah
  const handleVerifikasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileVerifikasi) {
      setMessage({ type: "error", text: "Pilih file ijazah untuk diverifikasi!" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "info", text: "Memverifikasi ijazah..." });

      const hash = await generateHash(fileVerifikasi);
      const contract = await getContract();
      console.log("Verifying with NIM:", formVerifikasi.nim, "and Hash:", hash);

      const isValid = await contract.verifikasiIjazah(formVerifikasi.nim, hash);
      setVerifikasiResult(isValid);

      if (isValid) {
        setMessage({ type: "success", text: "✅ IJAZAH VALID - Hash cocok dengan blockchain!" });
      } else {
        setMessage({ type: "error", text: "❌ IJAZAH TIDAK VALID - Hash tidak cocok atau NIM tidak terdaftar!" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Gagal memverifikasi ijazah" });
    } finally {
      setLoading(false);
    }
  };

  // Cari Ijazah
  const handleCariIjazah = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ type: "info", text: "Mencari data ijazah..." });

      const contract = await getContract();
      const data = await contract.getIjazah(formCari.nim);

      if (data.nim === "") {
        setMessage({ type: "error", text: "Data ijazah tidak ditemukan!" });
        setIjazahData(null);
      } else {
        setIjazahData({
          namaPemilik: data.namaPemilik,
          nim: data.nim,
          prodi: data.prodi,
          tahunLulus: data.tahunLulus,
          hashIjazah: data.hashIjazah,
          valid: data.valid,
        });
        setMessage({ type: "success", text: "Data ijazah ditemukan!" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Gagal mencari data ijazah" });
    } finally {
      setLoading(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount("");
        } else {
          setAccount(accounts[0]);
        }
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🎓 Verifikasi Ijazah Blockchain
          </h1>
          <p className="text-gray-300">
            Sistem verifikasi ijazah terdesentralisasi berbasis Ethereum
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Network: Sepolia Testnet | Contract:{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              {CONTRACT_ADDRESS.slice(0, 10)}...
            </a>
          </p>
        </div>

        {/* Connect Wallet */}
        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <p className="text-gray-300 mb-4">Hubungkan wallet untuk melanjutkan</p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Menghubungkan..." : "🦊 Connect Metamask"}
            </button>
          </div>
        ) : (
          <>
            {/* Connected Account */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-400">
                ✅ Terhubung: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: "verifikasi", label: "🔍 Verifikasi" },
                { id: "cari", label: "📋 Cari Data" },
                { id: "tambah", label: "➕ Tambah" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-white text-purple-900"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl mb-6 ${
                  message.type === "success"
                    ? "bg-green-500/20 border border-green-500/50 text-green-400"
                    : message.type === "error"
                    ? "bg-red-500/20 border border-red-500/50 text-red-400"
                    : "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              {/* Verifikasi Tab */}
              {activeTab === "verifikasi" && (
                <form onSubmit={handleVerifikasi} className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Verifikasi Ijazah</h2>
                  <div>
                    <label className="block text-gray-300 mb-2">NIM</label>
                    <input
                      type="text"
                      value={formVerifikasi.nim}
                      onChange={(e) => setFormVerifikasi({ nim: e.target.value })}
                      placeholder="Masukkan NIM"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">File Ijazah (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileVerifikasi(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Memverifikasi..." : "🔍 Verifikasi Ijazah"}
                  </button>

                  {verifikasiResult !== null && (
                    <div
                      className={`p-6 rounded-xl text-center ${
                        verifikasiResult
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-red-500/20 border-2 border-red-500"
                      }`}
                    >
                      <p className={`text-2xl font-bold ${verifikasiResult ? "text-green-400" : "text-red-400"}`}>
                        {verifikasiResult ? "✅ IJAZAH VALID" : "❌ IJAZAH TIDAK VALID"}
                      </p>
                    </div>
                  )}
                </form>
              )}

              {/* Cari Tab */}
              {activeTab === "cari" && (
                <form onSubmit={handleCariIjazah} className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Cari Data Ijazah</h2>
                  <div>
                    <label className="block text-gray-300 mb-2">NIM</label>
                    <input
                      type="text"
                      value={formCari.nim}
                      onChange={(e) => setFormCari({ nim: e.target.value })}
                      placeholder="Masukkan NIM"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Mencari..." : "📋 Cari Data"}
                  </button>

                  {ijazahData && (
                    <div className="bg-white/5 rounded-xl p-6 mt-4 space-y-3">
                      <h3 className="text-lg font-bold text-white mb-4">Data Ijazah</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Nama Pemilik</p>
                          <p className="text-white font-semibold">{ijazahData.namaPemilik}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">NIM</p>
                          <p className="text-white font-semibold">{ijazahData.nim}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Program Studi</p>
                          <p className="text-white font-semibold">{ijazahData.prodi}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Tahun Lulus</p>
                          <p className="text-white font-semibold">{ijazahData.tahunLulus}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-400">Hash Ijazah</p>
                          <p className="text-white font-mono text-xs break-all">{ijazahData.hashIjazah}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-400">Status</p>
                          <p className={`font-bold ${ijazahData.valid ? "text-green-400" : "text-red-400"}`}>
                            {ijazahData.valid ? "✅ VALID" : "❌ TIDAK VALID"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Tambah Tab */}
              {activeTab === "tambah" && (
                <form onSubmit={handleTambahIjazah} className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-4">Tambah Ijazah Baru</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">NIM</label>
                      <input
                        type="text"
                        value={formTambah.nim}
                        onChange={(e) => setFormTambah({ ...formTambah, nim: e.target.value })}
                        placeholder="NIM"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Nama Pemilik</label>
                      <input
                        type="text"
                        value={formTambah.nama}
                        onChange={(e) => setFormTambah({ ...formTambah, nama: e.target.value })}
                        placeholder="Nama lengkap"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Program Studi</label>
                      <input
                        type="text"
                        value={formTambah.prodi}
                        onChange={(e) => setFormTambah({ ...formTambah, prodi: e.target.value })}
                        placeholder="Program studi"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Tahun Lulus</label>
                      <input
                        type="text"
                        value={formTambah.tahunLulus}
                        onChange={(e) => setFormTambah({ ...formTambah, tahunLulus: e.target.value })}
                        placeholder="2025"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">File Ijazah (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileTambah(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white"
                      required
                    />
                    <p className="text-gray-400 text-sm mt-1">Hash SHA-256 akan di-generate otomatis dari file</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Mengirim ke Blockchain..." : "➕ Tambah Ijazah"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>UTS Pemrograman Solidity - Verifikasi Ijazah</p>
          <p>Holiq Ibrahim - 220320002 - Informatika</p>
        </div>
      </div>
    </main>
  );
}
