buat file auto-scync.ps1
# auto-sync.ps1
param(
  [string]$Message = "auto sync"
)

git add -A
git commit -m $Message
# hook post-commit akan otomatis menjalankan git push


cara jalankan
1. simpan di root folder
2. .\auto-sync.ps1 -Message "commit semua file,perubahan file proyek"

git add -A akan menambahkan file baru, perubahan, dan penghapusan. Cocok untuk sinkron penuh.
