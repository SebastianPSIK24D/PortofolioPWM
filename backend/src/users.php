<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET', 'POST', 'PUT'], true)) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method tidak diizinkan']);
    exit;
}

// Sumber data tergantung metode
$data = json_decode(file_get_contents('php://input'));
if ($method === 'POST') $data = (object) $_POST;   // FormData
if ($method === 'GET')  $data = (object) $_GET;    // query string

$token = trim($data->token ?? '');
if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'pesan' => 'Silahkan login terlebih dahulu']);
    exit;
}
verifyToken($token);

// GET (ambil profil user yang sedang login)
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT id, username, email, nama_lengkap, nomor_hp, foto,
        COALESCE(ringkasan, '') AS ringkasan, COALESCE(lokasi, '') AS lokasi,
        COALESCE(jabatan_target, '') AS jabatan_target, created_at
        FROM users WHERE token=? LIMIT 1");
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'success', 'user' => $user]);
    $conn->close();
    exit;
}

// UPDATE (validasi input)
$username    = trim($data->username ?? '');
$email       = trim($data->email ?? '');
$namaLengkap = trim($data->nama_lengkap ?? '');
$nomorHp     = trim($data->nomor_hp ?? '');
$password    = trim($data->password ?? '');

if ($username === '' || $email === '' || $namaLengkap === '' || $nomorHp === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'pesan' => 'Data user tidak boleh kosong']);
    exit;
}

// Ambil nilai lama
$stmtUser = $conn->prepare("SELECT foto, COALESCE(ringkasan, '') AS ringkasan,
    COALESCE(lokasi, '') AS lokasi, COALESCE(jabatan_target, '') AS jabatan_target
    FROM users WHERE token=? LIMIT 1");
$stmtUser->bind_param('s', $token);
$stmtUser->execute();
$currentUser = $stmtUser->get_result()->fetch_assoc();
$stmtUser->close();
$foto = $currentUser['foto'];

// Kolom CV
$potong = fn($s, $n) => function_exists('mb_substr') ? mb_substr($s, 0, $n) : $s;
$ringkasan     = isset($data->ringkasan)      ? $potong(trim((string) $data->ringkasan), 1000)      : $currentUser['ringkasan'];
$lokasi        = isset($data->lokasi)         ? $potong(trim((string) $data->lokasi), 255)          : $currentUser['lokasi'];
$jabatanTarget = isset($data->jabatan_target) ? $potong(trim((string) $data->jabatan_target), 255)  : $currentUser['jabatan_target'];

// Upload foto baru
if (isset($_FILES['foto']) && $_FILES['foto']['error'] !== UPLOAD_ERR_NO_FILE) {

    // cek kode error upload
    if ($_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Upload foto gagal']);
        exit;
    }

    // batas ukuran 5 MB
    if ($_FILES['foto']['size'] > 5 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['status' => 'error', 'message' => 'Ukuran foto maksimal 5 MB']);
        exit;
    }

    // cek MIME type asli dari isi berkas
    $allowedMimeTypes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];
    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($_FILES['foto']['tmp_name']);
    if (!isset($allowedMimeTypes[$mimeType])) {
        http_response_code(415);
        echo json_encode(['status' => 'error', 'message' => 'Format foto harus JPG, PNG, atau WEBP']);
        exit;
    }

    $uploadDirectory = __DIR__ . '/../uploads';
    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0755, true);
    }

    // nama acak
    $foto = bin2hex(random_bytes(16)) . '.' . $allowedMimeTypes[$mimeType];
    if (!move_uploaded_file($_FILES['foto']['tmp_name'], $uploadDirectory . '/' . $foto)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan foto di server']);
        exit;
    }
}

// ===== 4. Simpan perubahan ke database =====
if ($password !== '') {
    // Password baru diisi: di-hash lalu ikut diperbarui
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, `password`=?, nama_lengkap=?, nomor_hp=?, foto=?, ringkasan=?, lokasi=?, jabatan_target=? WHERE token=? LIMIT 1');
    $stmt->bind_param('ssssssssss', $username, $email, $passwordHash, $namaLengkap, $nomorHp, $foto, $ringkasan, $lokasi, $jabatanTarget, $token);
} else {
    // Password kosong: password lama tidak diubah
    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, nama_lengkap=?, nomor_hp=?, foto=?, ringkasan=?, lokasi=?, jabatan_target=? WHERE token=? LIMIT 1');
    $stmt->bind_param('sssssssss', $username, $email, $namaLengkap, $nomorHp, $foto, $ringkasan, $lokasi, $jabatanTarget, $token);
}

$stmt->execute();
$stmt->close();

echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui data user']);
$conn->close();