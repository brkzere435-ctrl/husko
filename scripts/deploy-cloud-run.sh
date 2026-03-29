#!/usr/bin/env bash
# Déploiement Husko sur Cloud Run — voir DEPLOIEMENT.md
#
# Prérequis :
#   gcloud auth login && gcloud config set project VOTRE_PROJET
#   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
#
# Usage :
#   export GCP_PROJECT="votre-projet-id"
#   export GCP_REGION="europe-west1"
#   export SERVICE_NAME="husko-web"
#   chmod +x scripts/deploy-cloud-run.sh
#   ./scripts/deploy-cloud-run.sh

set -euo pipefail

: "${GCP_PROJECT:?Définir GCP_PROJECT (ex: export GCP_PROJECT=mon-projet)}"
: "${GCP_REGION:=europe-west1}"
: "${SERVICE_NAME:=husko-web}"

TAG="$(date +%Y%m%d-%H%M%S)"
IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT}/husko/${SERVICE_NAME}:${TAG}"

echo "=== Configurer Docker pour Artifact Registry ==="
gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev" --quiet

echo "=== Créer le dépôt Artifact Registry si besoin ==="
gcloud artifacts repositories describe husko --location="${GCP_REGION}" --project="${GCP_PROJECT}" 2>/dev/null || \
  gcloud artifacts repositories create husko \
    --repository-format=docker \
    --location="${GCP_REGION}" \
    --project="${GCP_PROJECT}"

echo "=== Cloud Build : build Dockerfile et push ${IMAGE} ==="
gcloud builds submit --tag "${IMAGE}" --project="${GCP_PROJECT}" .

echo "=== Déployer Cloud Run ==="
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${GCP_REGION}" \
  --project "${GCP_PROJECT}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3

echo "=== URL ==="
gcloud run services describe "${SERVICE_NAME}" --region "${GCP_REGION}" --project="${GCP_PROJECT}" --format 'value(status.url)'
