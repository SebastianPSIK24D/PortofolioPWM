# backend/test_backend.ps1
$base  = "http://localhost:8000"
$ok    = 0
$gagal = 0

function Cek($nama, $kondisi) {
    if ($kondisi) { Write-Host "[LULUS] $nama" -ForegroundColor Green; $script:ok++ }
    else          { Write-Host "[GAGAL] $nama" -ForegroundColor Red;   $script:gagal++ }
}

# Mengembalikan kode status HTTP dari sebuah request (200 jika sukses)
function KodeStatus($blok) {
    try { & $blok | Out-Null; return 200 }
    catch { return [int]$_.Exception.Response.StatusCode }
}

Write-Host "`n=== AUTENTIKASI ===" -ForegroundColor Cyan

$login = Invoke-RestMethod -Method Post -Uri "$base/login" -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $login.token
Cek "Login benar mengembalikan token 64 karakter" ($token.Length -eq 64)

Cek "Login password salah ditolak (401)" ((KodeStatus { Invoke-RestMethod -Method Post -Uri "$base/login" -ContentType "application/json" -Body '{"username":"admin","password":"salah"}' }) -eq 401)

$v = Invoke-RestMethod -Method Post -Uri "$base/verify_login" -ContentType "application/json" -Body (@{ token = $token } | ConvertTo-Json)
Cek "verify_login: token valid" ($v.status -eq "success")

Write-Host "`n=== ROUTER & PUBLIK ===" -ForegroundColor Cyan

Cek "Endpoint tidak dikenal -> 404" ((KodeStatus { Invoke-RestMethod "$base/ngawur" }) -eq 404)
Cek "POST ke /public -> 405" ((KodeStatus { Invoke-RestMethod -Method Post -Uri "$base/public" }) -eq 405)

$pub = Invoke-RestMethod "$base/public"
Cek "/public mengembalikan status success" ($pub.status -eq "success")
$kolomProfil = $pub.data.profil.PSObject.Properties.Name
Cek "/public tidak membocorkan password dan token" (($kolomProfil -notcontains "password") -and ($kolomProfil -notcontains "token"))

Write-Host "`n=== PROFIL USER ===" -ForegroundColor Cyan

$prof = Invoke-RestMethod "$base/users?token=$token"
Cek "GET /users mengembalikan profil admin" ($prof.user.username -eq "admin")
Cek "GET /users tanpa token -> 401" ((KodeStatus { Invoke-RestMethod "$base/users" }) -eq 401)

Write-Host "`n=== CRUD ===" -ForegroundColor Cyan

$modul = @(
    @{ nama = "pendidikan"; kunci = "riwayat_pendidikan"; kolom = "nama_institusi"
       buat = @{ nama_institusi = "ZZ-TES-PENDIDIKAN"; tingkat = "S1"; jurusan = "TI"; tahun_mulai = 2020; tahun_selesai = 2024 } },
    @{ nama = "pengalaman"; kunci = "pengalaman"; kolom = "nama_perusahaan"
       buat = @{ nama_perusahaan = "ZZ-TES-PENGALAMAN"; jabatan = "Staf"; tahun_mulai = 2021; tahun_selesai = 2023 } },
    @{ nama = "keahlian"; kunci = "keahlian"; kolom = "nama_keahlian"
       buat = @{ nama_keahlian = "ZZ-TES-KEAHLIAN"; level = "Beginner" } },
    @{ nama = "karya"; kunci = "karya_terbaik"; kolom = "nama_karya"
       buat = @{ nama_karya = "ZZ-TES-KARYA"; deskripsi = "Karya uji"; url = "https://example.com" } },
    @{ nama = "kontak"; kunci = "kontak_aktif"; kolom = "nama_media"
       buat = @{ nama_media = "ZZ-TES-KONTAK"; url = "https://example.com/kontak" } }
)

foreach ($m in $modul) {
    $nama  = $m.nama
    $url   = "$base/$nama"
    $kol   = $m.kolom
    $nilai = $m.buat[$kol]

    Cek "$nama : tanpa token ditolak (401)" ((KodeStatus { Invoke-RestMethod $url }) -eq 401)

    # CREATE
    $b = @{ token = $token } + $m.buat
    Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Body ($b | ConvertTo-Json) | Out-Null

    # READ
    $list = @((Invoke-RestMethod "${url}?token=$token").($m.kunci))
    $item = $list | Where-Object { $_.$kol -eq $nilai } | Select-Object -First 1
    Cek "$nama : create + read" ($null -ne $item)
    if ($null -eq $item) { continue }

    # UPDATE
    $u = @{ token = $token; id = [int]$item.id } + $m.buat
    $u[$kol] = "$nilai-UBAH"
    Invoke-RestMethod -Method Put -Uri $url -ContentType "application/json" -Body ($u | ConvertTo-Json) | Out-Null
    $list  = @((Invoke-RestMethod "${url}?token=$token").($m.kunci))
    $item2 = $list | Where-Object { [int]$_.id -eq [int]$item.id }
    Cek "$nama : update" ($item2.$kol -eq "$nilai-UBAH")

    # DELETE
    $d = @{ token = $token; id = [int]$item.id }
    Invoke-RestMethod -Method Delete -Uri $url -ContentType "application/json" -Body ($d | ConvertTo-Json) | Out-Null
    $list  = @((Invoke-RestMethod "${url}?token=$token").($m.kunci))
    $item3 = $list | Where-Object { [int]$_.id -eq [int]$item.id }
    Cek "$nama : delete" ($null -eq $item3)
}

Write-Host "`n=== LOGOUT ===" -ForegroundColor Cyan

$out = Invoke-RestMethod -Method Post -Uri "$base/logout" -ContentType "application/json" -Body (@{ token = $token } | ConvertTo-Json)
Cek "Logout berhasil" ($out.status -eq "success")
Cek "Token lama ditolak setelah logout (401)" ((KodeStatus { Invoke-RestMethod "$base/keahlian?token=$token" }) -eq 401)

Write-Host "`nHASIL: $ok lulus, $gagal gagal" -ForegroundColor Yellow