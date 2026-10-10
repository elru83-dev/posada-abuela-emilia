# OPCIONAL: baja las fotos nuevas (2026) de los departamentos A y B del sitio actual a public\img\.
# Correr ANTES de apagar el WordPress. Después: commit + push y correr supabase/seed-fotos-2026.sql.
# Uso: clic derecho > "Ejecutar con PowerShell"
$ErrorActionPreference = "Stop"
$base = "https://posadaabuelaemilia.com.ar/wp-content/uploads/2026/02/"
$dir  = Join-Path $PSScriptRoot "public\img"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$ok = 0; $fallas = @()
foreach ($f in Get-Content (Join-Path $PSScriptRoot "imagenes.txt")) {
  if (-not $f.Trim()) { continue }
  $dest = Join-Path $dir $f
  if (Test-Path $dest) { $ok++; continue }
  try { Invoke-WebRequest -Uri ($base + $f) -OutFile $dest -UseBasicParsing; $ok++; Write-Host "OK  $f" }
  catch { $fallas += $f; Write-Host "ERR $f" -ForegroundColor Red }
}
Write-Host "`nDescargadas: $ok   Con error: $($fallas.Count)"
if ($fallas.Count) { $fallas | ForEach-Object { Write-Host "  - $_" } }
Read-Host "Enter para cerrar"
