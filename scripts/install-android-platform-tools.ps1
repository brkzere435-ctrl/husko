# Télécharge Android SDK Platform-Tools (Windows) dans le dépôt : tools/platform-tools/
# Usage : powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/install-android-platform-tools.ps1
$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ToolsDir = Join-Path $RepoRoot 'tools'
$ZipUrl = 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip'
$ZipPath = Join-Path $env:TEMP "husko-platform-tools-$([guid]::NewGuid().ToString('n').Substring(0, 8)).zip"

New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

Write-Host "[Husko] Telechargement: $ZipUrl"
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing

Write-Host "[Husko] Extraction vers $ToolsDir ..."
Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
Remove-Item -LiteralPath $ZipPath -Force

$Adb = Join-Path (Join-Path $ToolsDir 'platform-tools') 'adb.exe'
if (-not (Test-Path -LiteralPath $Adb)) {
  Write-Error "[Husko] adb.exe introuvable apres extraction (attendu: tools/platform-tools/adb.exe)"
}
Write-Host "[Husko] OK - adb: $Adb"
$PtBin = Join-Path $ToolsDir 'platform-tools'
Write-Host "[Husko] Ajouter au PATH (dossier a prepend):"
Write-Host $PtBin
