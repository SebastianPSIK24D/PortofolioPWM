<?php
require_once __DIR__ . '/library/dbconnection.php';

echo "Daftar tabel:\n";
$r = $conn->query('SHOW TABLES');
while ($row = $r->fetch_row()) {
    echo " - " . $row[0] . "\n";
}

echo "\nIsi tabel users:\n";
$u = $conn->query('SELECT id, username, LEFT(password, 7) AS hash FROM users')->fetch_assoc();
print_r($u);