<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$data = json_decode(file_get_contents('php://input'));
if (!$data && $_SERVER['REQUEST_METHOD'] === 'GET') $data = (object) $_GET;

$id         = (int) ($data->id ?? $_GET['id'] ?? 0);
$nama_media = trim($data->nama_media ?? '');
$url        = trim($data->url ?? '');
$token      = trim($data->token ?? $_GET['token'] ?? '');

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'pesan' => 'Silahkan login terlebih dahulu']);
    exit;
}
verifyToken($token);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM kontak_aktif ORDER BY id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'kontak_aktif' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare('INSERT INTO kontak_aktif (nama_media, `url`) VALUES (?, ?)');
    $stmt->bind_param('ss', $nama_media, $url);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan kontak!']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $conn->prepare('UPDATE kontak_aktif SET nama_media=?, `url`=? WHERE id=? LIMIT 1');
    $stmt->bind_param('ssi', $nama_media, $url, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui kontak!']);
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM kontak_aktif WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus kontak!']);
    $stmt->close();
}
$conn->close();