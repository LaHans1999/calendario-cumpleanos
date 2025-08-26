# Script para actualizar URLs de Google Apps Script en todos los archivos
# Guardar como update_urls.ps1

param (
    [Parameter(Mandatory=$true)]
    [string]$newUrl
)

Write-Host "Actualizando URLs de Google Apps Script a: $newUrl"

$archivos = @(
    "login.js", 
    "script.js", 
    "dashboard.js", 
    "sync.js"
)

foreach ($archivo in $archivos) {
    $rutaArchivo = Join-Path -Path (Get-Location) -ChildPath $archivo
    
    if (Test-Path $rutaArchivo) {
        Write-Host "Procesando archivo: $archivo"
        
        $contenido = Get-Content -Path $rutaArchivo -Raw
        
        # Patrón para buscar cualquier URL de Google Apps Script
        $patron = "https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec"
        
        # Reemplazar todas las ocurrencias con la nueva URL
        $nuevoContenido = $contenido -replace $patron, $newUrl
        
        # Guardar el archivo con el contenido actualizado
        Set-Content -Path $rutaArchivo -Value $nuevoContenido
        
        Write-Host "  URLs actualizadas correctamente" -ForegroundColor Green
    } else {
        Write-Host "  Archivo no encontrado: $archivo" -ForegroundColor Yellow
    }
}

Write-Host "Proceso completado." -ForegroundColor Cyan
