<?php
require_once __DIR__ . '/../library/cors.php';
require_once __DIR__ . '/../library/dbconnection.php';
require_once __DIR__ . '/../library/commonfunction.php';

$method = $_SERVER['REQUEST_METHOD'];

// Fungsi bantu 
function balas($kode, $isi)
{
    http_response_code($kode);
    echo json_encode($isi);
    exit;
}

function folderUpload()
{
    $dir = __DIR__ . '/../uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

// Hanya berkas gambar karya (karya_<32 hex>.ext) yang boleh dihapus,
// sehingga foto profil dan berkas lain tidak pernah ikut terhapus.
function hapusBerkasKarya($nama)
{
    if (!is_string($nama) || !preg_match('/^karya_[a-f0-9]{32}\.(jpg|png|webp)$/', $nama)) {
        return;
    }
    $path = folderUpload() . '/' . $nama;
    if (is_file($path)) {
        @unlink($path);
    }
}

// Validasi dan simpan gambar. Mengembalikan nama berkas, atau menghentikan skrip dengan galat.
function simpanGambarKarya($file)
{
    $kode = $file['error'];

    if ($kode === UPLOAD_ERR_INI_SIZE || $kode === UPLOAD_ERR_FORM_SIZE) {
        balas(413, ['status' => 'error', 'message' => 'Ukuran gambar melebihi batas server']);
    }
    if ($kode !== UPLOAD_ERR_OK) {
        balas(400, ['status' => 'error', 'message' => 'Upload gambar gagal']);
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        balas(413, ['status' => 'error', 'message' => 'Ukuran gambar maksimal 5 MB']);
    }

    // Cek tipe asli dari isi berkas, bukan dari ekstensi
    $izin = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($izin[$mime]) || @getimagesize($file['tmp_name']) === false) {
        balas(415, ['status' => 'error', 'message' => 'Format gambar harus JPG, PNG, atau WEBP']);
    }

    // Nama acak: tidak bisa ditebak dan tidak menimpa berkas lain
    $nama = 'karya_' . bin2hex(random_bytes(16)) . '.' . $izin[$mime];
    if (!move_uploaded_file($file['tmp_name'], folderUpload() . '/' . $nama)) {
        balas(500, ['status' => 'error', 'message' => 'Gagal menyimpan gambar di server']);
    }
    return $nama;
}

// Data terlalu besar untuk server
$tipe = $_SERVER['CONTENT_TYPE'] ?? '';
if ($method === 'POST' && empty($_POST) && empty($_FILES) && stripos($tipe, 'multipart/form-data') !== false) {
    balas(413, ['status' => 'error', 'message' => 'Ukuran data melebihi batas server. Gunakan gambar yang lebih kecil.']);
}

// Sumber data: FormData (multipart) atau JSON
if ($method === 'POST' && (!empty($_POST) || !empty($_FILES))) {
    $data = (object) $_POST;
} else {
    $data = json_decode(file_get_contents('php://input'));
    if (!$data && $method === 'GET') $data = (object) $_GET;
    if (!is_object($data)) $data = (object) [];
}

$potong = fn($s, $n) => function_exists('mb_substr') ? mb_substr($s, 0, $n) : substr($s, 0, $n);

$id          = (int) ($data->id ?? $_GET['id'] ?? 0);
$namaKarya   = $potong(trim((string) ($data->nama_karya ?? '')), 255);
$deskripsi   = $potong(trim((string) ($data->deskripsi ?? '')), 1000);
$url         = $potong(trim((string) ($data->url ?? '')), 255);
$hapusGambar = in_array((string) ($data->hapus_gambar ?? ''), ['1', 'true'], true);
$token       = trim((string) ($data->token ?? $_GET['token'] ?? ''));

if ($token === '') {
    balas(401, ['status' => 'error', 'pesan' => 'Silahkan login terlebih dahulu']);
}
verifyToken($token);

$adaFile = isset($_FILES['gambar']) && $_FILES['gambar']['error'] !== UPLOAD_ERR_NO_FILE;

// Read
if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT * FROM karya_terbaik ORDER BY id DESC');
    $stmt->execute();
    echo json_encode(['status' => 'success', 'karya_terbaik' => $stmt->get_result()->fetch_all(MYSQLI_ASSOC)]);
    $stmt->close();

// Create
} elseif ($method === 'POST' && $id === 0) {
    if ($namaKarya === '') {
        balas(400, ['status' => 'error', 'message' => 'Nama karya wajib diisi']);
    }

    $gambar = $adaFile ? simpanGambarKarya($_FILES['gambar']) : '';

    try {
        $stmt = $conn->prepare('INSERT INTO karya_terbaik (nama_karya, deskripsi, url, gambar) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $namaKarya, $deskripsi, $url, $gambar);
        $stmt->execute();
        $stmt->close();
    } catch (Throwable $e) {
        hapusBerkasKarya($gambar);
        balas(500, ['status' => 'error', 'message' => 'Gagal menyimpan karya']);
    }

    echo json_encode(['status' => 'success', 'message' => 'Berhasil menyimpan karya', 'gambar' => $gambar]);

// Update (PUT, atau POST yang membawa id)
} elseif ($method === 'PUT' || $method === 'POST') {
    if ($id <= 0) {
        balas(400, ['status' => 'error', 'message' => 'ID karya tidak valid']);
    }

    // Ambil gambar lama
    $stmt = $conn->prepare('SELECT gambar FROM karya_terbaik WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $lama = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$lama) {
        balas(404, ['status' => 'error', 'message' => 'Karya tidak ditemukan']);
    }

    $gambarLama = (string) ($lama['gambar'] ?? '');
    $gambar = $gambarLama;   // bawaan: gambar tidak berubah
    $baru = '';

    if ($adaFile) {
        $baru = simpanGambarKarya($_FILES['gambar']);
        $gambar = $baru;
    } elseif ($hapusGambar) {
        $gambar = '';
    }

    try {
        $stmt = $conn->prepare('UPDATE karya_terbaik SET nama_karya=?, deskripsi=?, url=?, gambar=? WHERE id=? LIMIT 1');
        $stmt->bind_param('ssssi', $namaKarya, $deskripsi, $url, $gambar, $id);
        $stmt->execute();
        $stmt->close();
    } catch (Throwable $e) {
        hapusBerkasKarya($baru);
        balas(500, ['status' => 'error', 'message' => 'Gagal memperbarui karya']);
    }

    // Berkas lama dihapus setelah database berhasil diperbarui
    if ($gambar !== $gambarLama) {
        hapusBerkasKarya($gambarLama);
    }

    echo json_encode(['status' => 'success', 'message' => 'Berhasil memperbarui karya', 'gambar' => $gambar]);

// Delete
} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('SELECT gambar FROM karya_terbaik WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $lama = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $stmt = $conn->prepare('DELETE FROM karya_terbaik WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    if ($lama) {
        hapusBerkasKarya((string) ($lama['gambar'] ?? ''));
    }
    echo json_encode(['status' => 'success', 'message' => 'Berhasil menghapus karya']);

} else {
    balas(405, ['status' => 'error', 'message' => 'Method tidak diizinkan']);
}

$conn->close();