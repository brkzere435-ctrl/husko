# Connexion GitHub (navigateur) + enregistrement des identifiants pour git push / gh.
# À lancer UNE FOIS dans ton terminal Windows (pas besoin de copier de token à la main).
$ErrorActionPreference = 'Stop'
$gh = Join-Path ${env:ProgramFiles} 'GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) {
  Write-Error 'Installe GitHub CLI : winget install GitHub.cli'
}

Write-Host "`nOuverture du flux GitHub (navigateur). Autorise l'acces, puis reviens ici.`n"
& $gh auth login -h github.com -p https -w -s repo -s read:org -s workflow --git-protocol https
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`nConfiguration de git pour utiliser GitHub CLI ..."
& $gh auth setup-git

Write-Host "`nConnexion OK. Pousse le code avec :  npm run git:github`n"
& $gh auth status
