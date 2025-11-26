import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("VerifikasiIjazah", async function () {
  const { viem } = await network.connect();

  // Data sample untuk testing
  const sampleIjazah = {
    nim: "123456789",
    namaPemilik: "John Doe",
    prodi: "Teknik Informatika",
    tahunLulus: "2024",
    hashIjazah:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // SHA-256 hash sample
  };

  describe("tambahIjazah", function () {
    it("Harus bisa menambahkan ijazah baru", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Tambah ijazah
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      // Cek data ijazah tersimpan dengan benar
      const ijazah = await verifikasiIjazah.read.getIjazah([sampleIjazah.nim]);

      assert.equal(ijazah.namaPemilik, sampleIjazah.namaPemilik);
      assert.equal(ijazah.nim, sampleIjazah.nim);
      assert.equal(ijazah.prodi, sampleIjazah.prodi);
      assert.equal(ijazah.tahunLulus, sampleIjazah.tahunLulus);
      assert.equal(ijazah.hashIjazah, sampleIjazah.hashIjazah);
      assert.equal(ijazah.valid, true);
    });

    it("Harus emit event IjazahDitambahkan", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      await viem.assertions.emitWithArgs(
        verifikasiIjazah.write.tambahIjazah([
          sampleIjazah.nim,
          sampleIjazah.namaPemilik,
          sampleIjazah.prodi,
          sampleIjazah.tahunLulus,
          sampleIjazah.hashIjazah,
        ]),
        verifikasiIjazah,
        "IjazahDitambahkan",
        [
          sampleIjazah.nim,
          sampleIjazah.namaPemilik,
          sampleIjazah.prodi,
          sampleIjazah.tahunLulus,
          sampleIjazah.hashIjazah,
        ]
      );
    });
  });

  describe("verifikasiIjazah", function () {
    it("Harus return TRUE ketika hash cocok (ijazah valid)", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Tambah ijazah terlebih dahulu
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      // Verifikasi dengan hash yang benar
      const isValid = await verifikasiIjazah.read.verifikasiIjazah([
        sampleIjazah.nim,
        sampleIjazah.hashIjazah,
      ]);

      assert.equal(isValid, true);
    });

    it("Harus return FALSE ketika hash tidak cocok (ijazah palsu)", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Tambah ijazah terlebih dahulu
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      // Verifikasi dengan hash yang salah (ijazah palsu)
      const hashPalsu =
        "0000000000000000000000000000000000000000000000000000000000000000";
      const isValid = await verifikasiIjazah.read.verifikasiIjazah([
        sampleIjazah.nim,
        hashPalsu,
      ]);

      assert.equal(isValid, false);
    });

    it("Harus return FALSE ketika NIM tidak terdaftar", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Verifikasi NIM yang tidak ada
      const isValid = await verifikasiIjazah.read.verifikasiIjazah([
        "999999999",
        sampleIjazah.hashIjazah,
      ]);

      assert.equal(isValid, false);
    });
  });

  describe("isIjazahTerdaftar", function () {
    it("Harus return TRUE untuk ijazah yang sudah terdaftar", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Tambah ijazah
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      const terdaftar = await verifikasiIjazah.read.isIjazahTerdaftar([
        sampleIjazah.nim,
      ]);

      assert.equal(terdaftar, true);
    });

    it("Harus return FALSE untuk ijazah yang belum terdaftar", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      const terdaftar = await verifikasiIjazah.read.isIjazahTerdaftar([
        "999999999",
      ]);

      assert.equal(terdaftar, false);
    });
  });

  describe("invalidasiIjazah", function () {
    it("Harus bisa menonaktifkan ijazah", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Tambah ijazah terlebih dahulu
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      // Invalidasi ijazah
      await verifikasiIjazah.write.invalidasiIjazah([sampleIjazah.nim]);

      // Cek status valid menjadi false
      const ijazah = await verifikasiIjazah.read.getIjazah([sampleIjazah.nim]);
      assert.equal(ijazah.valid, false);
    });
  });

  describe("Multiple Ijazah", function () {
    it("Harus bisa menyimpan dan memverifikasi beberapa ijazah", async function () {
      const verifikasiIjazah = await viem.deployContract("VerifikasiIjazah");

      // Data ijazah kedua
      const ijazah2 = {
        nim: "987654321",
        namaPemilik: "Jane Smith",
        prodi: "Sistem Informasi",
        tahunLulus: "2023",
        hashIjazah:
          "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      };

      // Tambah kedua ijazah
      await verifikasiIjazah.write.tambahIjazah([
        sampleIjazah.nim,
        sampleIjazah.namaPemilik,
        sampleIjazah.prodi,
        sampleIjazah.tahunLulus,
        sampleIjazah.hashIjazah,
      ]);

      await verifikasiIjazah.write.tambahIjazah([
        ijazah2.nim,
        ijazah2.namaPemilik,
        ijazah2.prodi,
        ijazah2.tahunLulus,
        ijazah2.hashIjazah,
      ]);

      // Verifikasi kedua ijazah
      const isValid1 = await verifikasiIjazah.read.verifikasiIjazah([
        sampleIjazah.nim,
        sampleIjazah.hashIjazah,
      ]);

      const isValid2 = await verifikasiIjazah.read.verifikasiIjazah([
        ijazah2.nim,
        ijazah2.hashIjazah,
      ]);

      assert.equal(isValid1, true);
      assert.equal(isValid2, true);

      // Cross-verify: hash ijazah 1 tidak cocok dengan NIM ijazah 2
      const crossCheck = await verifikasiIjazah.read.verifikasiIjazah([
        sampleIjazah.nim,
        ijazah2.hashIjazah,
      ]);

      assert.equal(crossCheck, false);
    });
  });
});
