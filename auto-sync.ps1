param([string]$Message = "auto sync")

# Tambahkan semua perubahan
git add -A

# Commit dengan pesan dari parameter
git commit -m $Message

# Info ke user
Write-Host "🔄 Sinkronisasi dengan GitHub..."

# Ambil update dari remote dan lakukan rebase
git fetch origin
git rebase origin/main

# Push ke GitHub
Write-Host "Commit selesai - otomatis push ke GitHub..."
git push origin main --force-with-lease
