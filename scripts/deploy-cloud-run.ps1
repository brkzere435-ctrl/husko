# Déploiement Cloud Run — voir DEPLOIEMENT.md
# Prérequis : gcloud installé, `gcloud auth login`, projet configuré

param(
  [Parameter(Mandatory = $true)][string]$GcpProject,
  [string]$GcpRegion = "europe-west1",
  [string]$ServiceName = "husko-web"
)

$ErrorActionPreference = "Stop"
$tag = Get-Date -Format "yyyyMMdd-HHmmss"
$image = "$GcpRegion-docker.pkg.dev/$GcpProject/husko/${ServiceName}:$tag"

Write-Host "=== Configure Docker auth ===" 
gcloud auth configure-docker "$GcpRegion-docker.pkg.dev" --quiet

Write-Host "=== Repository Artifact Registry ===" 
$repo = gcloud artifacts repositories describe husko --location=$GcpRegion --project=$GcpProject 2>$null
if (-not $repo) {
  gcloud artifacts repositories create husko --repository-format=docker --location=$GcpRegion --project=$GcpProject
}

Write-Host "=== Cloud Build ===" 
gcloud builds submit --tag $image --project $GcpProject .

Write-Host "=== Cloud Run ===" 
gcloud run deploy $ServiceName `
  --image $image `
  --region $GcpRegion `
  --project $GcpProject `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --min-instances 0 `
  --max-instances 3

Write-Host "=== URL ===" 
gcloud run services describe $ServiceName --region $GcpRegion --project $GcpProject --format "value(status.url)"
