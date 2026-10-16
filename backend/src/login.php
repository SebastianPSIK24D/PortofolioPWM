<?php
require_once __DIR__ . '/../library/cors.php';

// Hanya metode POST yang diizinkan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Hanya metode POST yang diterima.']);
    exit;
}

require_once __DIR__ . '/../library/dbconnection.php';

// Membaca payload JSON dari body request
$data = json_decode(file_get_contents('php://input'));

$username = trim($data->username ?? '');
$password = trim($data->password ?? '');

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username dan Password tidak boleh kosong!']);
    exit;
}

// Cari user berdasarkan username (prepared statement)
$stmt = $conn->prepare('SELECT id, username, `password` FROM users WHERE username=?');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Cocokkan password dengan hash di database
    if (password_verify($password, $row['password'])) {
        // Token acak: 32 byte = 64 karakter heksadesimal
        $token = bin2hex(random_bytes(32));

        // Simpan token ke user tersebut
        $updateStmt = $conn->prepare('UPDATE users SET token=? WHERE id=? LIMIT 1');
        $updateStmt->bind_param('si', $token, $row['id']);
        if (!$updateStmt->execute()) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Gagal memperbarui token!']);
            exit;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Login berhasil',
            'user' => [
                'id' => $row['id'],
                'username' => $row['username']
            ],
            'token' => $token
        ]);
        exit;
    }
}

// Username tidak ada ATAU password salah (pesan sengaja disamakan)
http_response_code(401);
echo json_encode(['status' => 'error', 'message' => 'Username atau password salah!']);

$stmt->close();
$conn->close();