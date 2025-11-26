import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition module untuk deploy VerifikasiIjazah contract
 */
const VerifikasiIjazahModule = buildModule("VerifikasiIjazahModule", (m) => {
  // Deploy VerifikasiIjazah contract
  const verifikasiIjazah = m.contract("VerifikasiIjazah");

  return { verifikasiIjazah };
});

export default VerifikasiIjazahModule;
