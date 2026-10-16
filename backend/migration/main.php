<?php
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

// 1. Reset database
executeQuery('DROP DATABASE IF EXISTS portofolio', 'Database Dropped');
executeQuery('CREATE DATABASE IF NOT EXISTS portofolio', 'Database Created');

$conn->select_db(DB_NAME);

// 2. Tabel users
executeQuery('CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nomor_hp VARCHAR(255) NOT NULL,
    foto VARCHAR(255) NOT NULL,
    ringkasan TEXT NULL,
    lokasi VARCHAR(255) NULL,
    jabatan_target VARCHAR(255) NULL,
    token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Users Table Created');

// 3. Tabel riwayat_pendidikan
executeQuery('CREATE TABLE riwayat_pendidikan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_institusi VARCHAR(255) NOT NULL,
    tingkat VARCHAR(255) NOT NULL,
    jurusan VARCHAR(255) NOT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Riwayat Pendidikan Table Created');

// 4. Tabel pengalaman
executeQuery('CREATE TABLE pengalaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_perusahaan VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    deskripsi TEXT NULL,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Pengalaman Table Created');

// 5. Tabel kontak_aktif
executeQuery('CREATE TABLE kontak_aktif (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_media VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    gambar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Kontak Aktif Table Created');

// 6. Tabel keahlian
executeQuery('CREATE TABLE keahlian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_keahlian VARCHAR(255) NOT NULL,
    level VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Keahlian Table Created');

// 7. Tabel karya_terbaik
executeQuery('CREATE TABLE karya_terbaik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_karya VARCHAR(255) NOT NULL,
    deskripsi TEXT NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)', 'Karya Terbaik Table Created');

// 8. Seeding akun admin default
$hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
executeQuery("INSERT INTO users (username, email, password, nama_lengkap, nomor_hp, foto)
    VALUES ('admin', 'admin@example.com', '$hashedPassword', 'Administrator', '081234567890', 'default.png')",
    'Default User Created');

$conn->close();