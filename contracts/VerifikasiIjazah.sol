// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VerifikasiIjazah
 * @dev Smart contract untuk verifikasi ijazah berbasis blockchain
 * @notice Contract ini digunakan untuk menyimpan dan memverifikasi data ijazah
 */
contract VerifikasiIjazah {
    // Struktur data untuk menyimpan informasi ijazah
    struct Ijazah {
        string namaPemilik;
        string nim;
        string prodi;
        string tahunLulus;
        string hashIjazah;
        bool valid;
    }

    // Mapping untuk menyimpan data ijazah berdasarkan NIM
    mapping(string => Ijazah) public dataIjazah;

    // Event untuk mencatat penambahan ijazah baru
    event IjazahDitambahkan(
        string nim,
        string namaPemilik,
        string prodi,
        string tahunLulus,
        string hashIjazah
    );

    // Event untuk mencatat verifikasi ijazah
    event IjazahDiverifikasi(
        string nim,
        bool hasil
    );

    /**
     * @dev Menambahkan data ijazah baru ke blockchain
     * @param _nim NIM mahasiswa
     * @param _namaPemilik Nama pemilik ijazah
     * @param _prodi Program studi
     * @param _tahunLulus Tahun lulus
     * @param _hashIjazah Hash SHA-256 dari dokumen ijazah PDF
     */
    function tambahIjazah(
        string memory _nim,
        string memory _namaPemilik,
        string memory _prodi,
        string memory _tahunLulus,
        string memory _hashIjazah
    ) public {
        // Simpan data ijazah ke mapping
        dataIjazah[_nim] = Ijazah(
            _namaPemilik,
            _nim,
            _prodi,
            _tahunLulus,
            _hashIjazah,
            true
        );

        // Emit event
        emit IjazahDitambahkan(_nim, _namaPemilik, _prodi, _tahunLulus, _hashIjazah);
    }

    /**
     * @dev Memverifikasi ijazah dengan membandingkan hash
     * @param _nim NIM mahasiswa yang akan diverifikasi
     * @param _hashInput Hash dari dokumen yang akan diverifikasi
     * @return bool true jika hash cocok (ijazah valid), false jika tidak cocok
     */
    function verifikasiIjazah(string memory _nim, string memory _hashInput)
        public
        view
        returns (bool)
    {
        // Bandingkan hash yang tersimpan dengan hash input menggunakan keccak256
        return (keccak256(bytes(dataIjazah[_nim].hashIjazah)) ==
            keccak256(bytes(_hashInput)));
    }

    /**
     * @dev Mengambil data lengkap ijazah berdasarkan NIM
     * @param _nim NIM mahasiswa
     * @return Ijazah struct berisi semua data ijazah
     */
    function getIjazah(string memory _nim) 
        public 
        view 
        returns (Ijazah memory) 
    {
        return dataIjazah[_nim];
    }

    /**
     * @dev Mengecek apakah ijazah dengan NIM tertentu sudah terdaftar
     * @param _nim NIM mahasiswa
     * @return bool true jika ijazah sudah terdaftar
     */
    function isIjazahTerdaftar(string memory _nim) 
        public 
        view 
        returns (bool) 
    {
        return dataIjazah[_nim].valid;
    }

    /**
     * @dev Menonaktifkan/invalidasi ijazah (misalnya jika ijazah dicabut)
     * @param _nim NIM mahasiswa yang ijazahnya akan dinonaktifkan
     */
    function invalidasiIjazah(string memory _nim) public {
        dataIjazah[_nim].valid = false;
    }
}
