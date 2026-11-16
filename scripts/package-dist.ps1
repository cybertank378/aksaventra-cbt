$ErrorActionPreference = "Stop"

if (-not (Test-Path ".next\standalone")) {
    Write-Error "Folder '.next\standalone' tidak ditemukan. Jalankan 'npm run build' terlebih dahulu."
    exit 1
}

Write-Host "Membersihkan folder dist-aksaventra-cbt..." -ForegroundColor Cyan
Remove-Item -Recurse -Force dist-aksaventra-cbt -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path dist-aksaventra-cbt | Out-Null

Write-Host "Menyalin hasil build standalone dan aset ke dist-aksaventra-cbt..." -ForegroundColor Cyan
Copy-Item -Path ".next\standalone\*" -Destination "dist-aksaventra-cbt" -Recurse -Force
Copy-Item -Path ".next\static" -Destination "dist-aksaventra-cbt\.next\static" -Recurse -Force
Copy-Item -Path "prisma" -Destination "dist-aksaventra-cbt\prisma" -Recurse -Force
Copy-Item -Path "prisma.config.ts" -Destination "dist-aksaventra-cbt\prisma.config.ts" -Recurse -Force
Copy-Item -Path "public" -Destination "dist-aksaventra-cbt\public" -Recurse -Force

Write-Host "Selesai! Paket production siap di 'dist-aksaventra-cbt'." -ForegroundColor Green
