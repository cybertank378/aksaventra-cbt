$ErrorActionPreference = "Stop"

$DistDir = "dist-aksaventra-cbt"

if (-not (Test-Path ".next\standalone")) {
    Write-Error "Folder '.next\standalone' tidak ditemukan. Jalankan 'npm run build' terlebih dahulu."
    exit 1
}

Write-Host "Membersihkan folder $DistDir..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $DistDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

Write-Host "Menyalin hasil build standalone (termasuk hidden dotfiles .next)..." -ForegroundColor Cyan
Get-ChildItem -Path ".next\standalone" -Force | Copy-Item -Destination $DistDir -Recurse -Force

Write-Host "Menyalin static assets & public..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$DistDir\.next" | Out-Null
Copy-Item -Path ".next\static" -Destination "$DistDir\.next\static" -Recurse -Force
if (Test-Path "public") {
    Copy-Item -Path "public" -Destination "$DistDir\public" -Recurse -Force
}

Write-Host "Memastikan native binaries (Argon2 & Prisma) ikut tersalin..." -ForegroundColor Cyan
if (Test-Path "node_modules\argon2\prebuilds") {
    New-Item -ItemType Directory -Force -Path "$DistDir\node_modules\argon2" | Out-Null
    Copy-Item -Path "node_modules\argon2\prebuilds" -Destination "$DistDir\node_modules\argon2\prebuilds" -Recurse -Force
}

if (Test-Path "node_modules\.prisma") {
    Copy-Item -Path "node_modules\.prisma" -Destination "$DistDir\node_modules\.prisma" -Recurse -Force
}

if (Test-Path "prisma") {
    Copy-Item -Path "prisma" -Destination "$DistDir\prisma" -Recurse -Force
}
if (Test-Path "prisma.config.ts") {
    Copy-Item -Path "prisma.config.ts" -Destination "$DistDir\prisma.config.ts" -Force
}

# Verifikasi file kritikal
$RequiredFiles = @(
    "$DistDir\server.js",
    "$DistDir\.next\required-server-files.json"
)
foreach ($File in $RequiredFiles) {
    if (-not (Test-Path $File)) {
        Write-Error "Verifikasi gagal: '$File' tidak ditemukan di hasil package!"
        exit 1
    }
}

Write-Host "Selesai! Paket production siap dan terverifikasi di '$DistDir'." -ForegroundColor Green