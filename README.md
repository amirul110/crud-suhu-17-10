i B – Gunakan Git Hooks (lebih “profesional”)

Buat file hook otomatis di .git/hooks/:

Buka terminal di root proyek.

Jalankan:

cd .git/hooks


Buat file bernama post-commit:

nano post-commit


Isi dengan:

#!/bin/bash
git push origin main


Simpan dan beri izin eksekusi:

chmod +x post-commit


Sekarang setiap kamu commit (manual), Git otomatis push ke GitHub setelahnya.
Kalau mau auto-commit juga setiap perubahan file, bisa kombinasikan dengan cron job atau watch script.




untuk simpan rekam kode
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
