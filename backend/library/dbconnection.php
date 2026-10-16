<?php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'portofolio');

// Membuat koneksi ke server MySQL (belum memilih database)
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

// Cek apakah koneksi berhasil
if ($conn->connect_error) {
    die('Koneksi gagal: ' . $conn->connect_error);
}

// Coba memilih database target
try {
    $conn->select_db(DB_NAME);
} catch (mysqli_sql_exception $e) {
    // Database belum ada (normal saat migrasi pertama kali dijalankan)
}