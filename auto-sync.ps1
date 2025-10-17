# auto-sync.ps1
param(
  [string]$Message = "auto sync"
)

git add -A
git commit -m $Message
# hook post-commit akan otomatis menjalankan git push
