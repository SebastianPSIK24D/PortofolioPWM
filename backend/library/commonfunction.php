<?php
// Menjalankan query dan menampilkan pesan status (dipakai skrip migrasi)
function executeQuery($query, $message = '')
{
    global $conn;
    if (!$conn->query($query)) {
        die('Error: ' . $conn->error);
    }
    if ($message) {
        echo '   ' . $message . "\n";
    }
}

// Memverifikasi token yang dikirim klien
function verifyToken($token)
{
    global $conn;

    // Prepared statement: mencegah SQL Injection
    $stmt = $conn->prepare("SELECT id FROM users WHERE token=? LIMIT 1");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $isValid = $result->num_rows === 1;
    $stmt->close();

    // Token tidak ditemukan di tabel users
    if (!$isValid) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'pesan' => 'Token tidak valid']);
        exit; // hentikan skrip seketika
    }

    return true;
}