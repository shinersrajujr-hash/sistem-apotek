# deploy.ps1 — Script deploy otomatis ke gh-pages
# Jalankan dari folder root: .\deploy.ps1

Write-Host "=== Build aplikasi ===" -ForegroundColor Cyan
npx vite build
if ($LASTEXITCODE -ne 0) { Write-Host "Build gagal!" -ForegroundColor Red; exit 1 }

Write-Host "=== Pindah ke gh-pages ===" -ForegroundColor Cyan
git checkout gh-pages

# Salin hasil build ke frontend/ dengan path yang benar
Write-Host "=== Update frontend/ ===" -ForegroundColor Cyan
Copy-Item -Force "dist\script.js"  "frontend\script.js"
Copy-Item -Force "dist\style.css"  "frontend\style.css"

# index.html selalu pakai path /sistem-apotek/frontend/
$htmlContent = @"
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Apotek Sehat - Sistem Manajemen Apotek</title>
    <script type="module" crossorigin src="/sistem-apotek/frontend/script.js"></script>
    <link rel="stylesheet" crossorigin href="/sistem-apotek/frontend/style.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
"@

$htmlContent | Out-File -FilePath "frontend\index.html" -Encoding utf8 -NoNewline
$htmlContent | Out-File -FilePath "index.html"          -Encoding utf8 -NoNewline

# Commit dan push
git add frontend/ index.html
git commit -m "deploy: update build $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin gh-pages

# Kembali ke main
git checkout main
Write-Host "=== Deploy selesai! ===" -ForegroundColor Green
Write-Host "Buka: https://shinersrajujr-hash.github.io/sistem-apotek/" -ForegroundColor Cyan
