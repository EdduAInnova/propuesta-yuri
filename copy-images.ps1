Write-Host "Copiando imagenes de public/ a raiz..." -ForegroundColor Cyan

$archivos = @(
    "logo.png",
    "og-image.jpg",
    "favicon.ico",
    "apple-touch-icon.png",
    "android-chrome-512x512.png",
    "android-chrome-192x192.png",
    "favicon-32x32.png",
    "favicon-16x16.png"
)

foreach ($archivo in $archivos) {
    $origen = "public\$archivo"
    if (Test-Path $origen) {
        Copy-Item $origen . -Force
        Write-Host "✓ Copiado: $archivo" -ForegroundColor Green
    }
    else {
        Write-Host "✗ No encontrado: $archivo" -ForegroundColor Red
    }
}

Write-Host "`nVerificando archivos en raiz..." -ForegroundColor Cyan
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "✓ $archivo existe en raiz" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $archivo NO existe en raiz" -ForegroundColor Red
    }
}

Write-Host "`n¡Listo! Presiona Enter para cerrar..." -ForegroundColor Yellow
Read-Host
