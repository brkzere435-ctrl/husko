# Crée le dépôt « husko » sur ton compte GitHub et pousse la branche courante.
# Sans interaction : définis GITHUB_TOKEN (PAT : scope « repo » ; pour Actions ajoute « workflow »).
# Sinon : exécute une fois « gh auth login », puis relance ce script.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$gh = Join-Path ${env:ProgramFiles} 'GitHub CLI\gh.exe'
if (-not (Test-Path $gh)) {
  Write-Error 'GitHub CLI introuvable. Installe : winget install GitHub.cli'
}

if ($env:GITHUB_TOKEN) {
  $env:GITHUB_TOKEN | & $gh auth login --with-token 2>$null
}

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host @'

Authentification manquante.

  A) PAT (recommandé pour tout automatiser) :
     PowerShell :  $env:GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
                   .\scripts\github-sync.ps1

  B) Navigateur (une fois) :
     gh auth login
     .\scripts\github-sync.ps1

'@
  exit 1
}

$login = (& $gh api user --jq .login).Trim()
if (-not $login) { Write-Error 'Login GitHub introuvable.' }

$repo = 'husko'
$full = "$login/$repo"
$cloneUrl = "https://github.com/$login/$repo.git"

& $gh repo view $full 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Création du dépôt public $full …"
  & $gh repo create $repo --public --description 'Husko By Night — Expo / EAS'
}

git remote remove origin 2>$null
git remote add origin $cloneUrl

$branch = (git branch --show-current).Trim()
if (-not $branch) { $branch = 'master' }

Write-Host "git push -u origin $branch …"
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
  Write-Host "`nOK — https://github.com/$full"
}
