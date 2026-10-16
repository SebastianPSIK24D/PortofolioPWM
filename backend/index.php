<?php
// Ambil path dari URL yang diminta
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($requestUri, '/');

// Penyajian berkas statis (folder uploads/)
if (strpos($path, 'uploads/') === 0) {
    $staticFile = __DIR__ . '/uploads/' . basename($path);
    if (is_file($staticFile)) {
        $mime = mime_content_type($staticFile);
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: ' . ($mime ?: 'application/octet-stream'));
        readfile($staticFile);
        exit;
    }
    http_response_code(404);
    exit;
}

// Semua respons selain berkas statis berformat JSON
header('Content-Type: application/json');

// Jika mengakses root '/'
if ($path === '') {
    echo json_encode(['message' => 'Selamat datang di backend portofolio']);
    exit;
}

// Routing dinamis ke folder src/
$safePath = basename($path);
$filePath = __DIR__ . '/src/' . $safePath . '.php';

if (file_exists($filePath)) {
    require_once $filePath;
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint tidak ditemukan']);
}