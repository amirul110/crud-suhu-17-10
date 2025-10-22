param([string]$Message = "auto sync")

git add -A git commit -m $Message

Write-Host "🔄 Sinkronisasi dengan GitHub..." git fetch origin git rebase origin/main

Write-Host "✅ Commit selesai — otomatis push ke GitHub..." git push origin main --force-with-lease