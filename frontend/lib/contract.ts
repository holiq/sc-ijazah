export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "_nim", type: "string" },
      { internalType: "string", name: "_namaPemilik", type: "string" },
      { internalType: "string", name: "_prodi", type: "string" },
      { internalType: "string", name: "_tahunLulus", type: "string" },
      { internalType: "string", name: "_hashIjazah", type: "string" },
    ],
    name: "tambahIjazah",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_nim", type: "string" },
      { internalType: "string", name: "_hashInput", type: "string" },
    ],
    name: "verifikasiIjazah",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_nim", type: "string" }],
    name: "getIjazah",
    outputs: [
      {
        components: [
          { internalType: "string", name: "namaPemilik", type: "string" },
          { internalType: "string", name: "nim", type: "string" },
          { internalType: "string", name: "prodi", type: "string" },
          { internalType: "string", name: "tahunLulus", type: "string" },
          { internalType: "string", name: "hashIjazah", type: "string" },
          { internalType: "bool", name: "valid", type: "bool" },
        ],
        internalType: "struct VerifikasiIjazah.Ijazah",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_nim", type: "string" }],
    name: "isIjazahTerdaftar",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "nim", type: "string" },
      {
        indexed: false,
        internalType: "string",
        name: "namaPemilik",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "prodi", type: "string" },
      {
        indexed: false,
        internalType: "string",
        name: "tahunLulus",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "hashIjazah",
        type: "string",
      },
    ],
    name: "IjazahDitambahkan",
    type: "event",
  },
];

export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
