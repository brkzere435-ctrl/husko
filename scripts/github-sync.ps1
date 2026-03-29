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

Authentification GitHub absente pour gh.

  1) Dans ce dossier projet, lance :   npm run git:github:login
     (navigateur → autoriser → terminé)

  2) Puis :   npm run git:github

  Ou PAT : $env:GITHUB_TOKEN="ghp_…" puis npm run git:github

'@
  exit 1
}

& $gh auth setup-git 2>$null

$login = (& $gh api user --jq .login).Trim()
if (-not $login) { Write-Error 'Login GitHub introuvable.' }

$repo = 'husko'
$owner = $login
if ($env:GITHUB_OWNER -and $env:GITHUB_OWNER.Trim()) {
  $owner = $env:GITHUB_OWNER.Trim()
}
$full = "$owner/$repo"
$cloneUrl = "https://github.com/$owner/$repo.git"

& $gh repo view $full 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Création du dépôt public $full …"
  if ($owner -eq $login) {
    & $gh repo create $repo --public --description 'Husko By Night — Expo / EAS'
  } else {
    & $gh repo create $full --public --description 'Husko By Night — Expo / EAS'
  }
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
