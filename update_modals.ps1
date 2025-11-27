# Script para copiar el modal de agendamiento de corporate.html a agile.html y premium.html

$sourceFile = "corporate.html"
$targetFiles = @("agile.html", "premium.html")

# Leer corporate.html
$corporateContent = Get-Content $sourceFile -Raw

# Extraer la sección del modal (desde "<!-- Flatpickr CSS -->" hasta antes de "<!-- FOOTER -->")
$modalSection = [regex]::Match($corporateContent, '(?s)(    <!-- Flatpickr CSS -->.*?</script>)\r?\n\r?\n').Groups[1].Value

# Para cada archivo objetivo
foreach ($targetFile in $targetFiles) {
    Write-Host "Procesando $targetFile..."
    
    $content = Get-Content $targetFile -Raw
    
    # Reemplazar la sección del modal
    $newContent = $content -replace '(?s)(    <!-- MODAL DE CONTACTO -->.*?</div>\r?\n    </div>)\r?\n\r?\n', "$modalSection`r`n`r`n"
    
    # Guardar
    $newContent | Set-Content $targetFile -NoNewline
    
    Write-Host "$targetFile actualizado exitosamente"
}

Write-Host "Proceso completado!"
