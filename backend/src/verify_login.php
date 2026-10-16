<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$data = json_decode(file_get_contents('php://input'));
$token = trim($data->token ?? $_GET['token'] ?? '');

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Token tidak boleh kosong']);
    exit;
}

// Jika tidak valid, verifyToken() langsung membalas 401 dan berhenti
verifyToken($token);

echo json_encode(['status' => 'success', 'message' => 'Token valid']);
$conn->close();