#!/usr/bin/env bash
# Deploy mmdGenerator container on Raspberry Pi (or any host).
# Usage: ./deploy-on-pi.sh [VERSION]
# VERSION defaults to 'latest'. Image: ghcr.io/OWNER/mmdgenerator:VERSION
# Set env: IMAGE_NAME=ghcr.io/owner/mmdgenerator (optional)
# Apache-2.0 - mmdGenerator

set -e
VERSION="${1:-latest}"
IMAGE_NAME="${IMAGE_NAME:-ghcr.io/$(whoami)/mmdgenerator}"
IMAGE="${IMAGE_NAME}:${VERSION}"
CONTAINER_NAME="${CONTAINER_NAME:-mmdgenerator}"
DATA_VOLUME="${DATA_VOLUME:-mmdgenerator-data}"
LOG_VOLUME="${LOG_VOLUME:-mmdgenerator-logs}"
PORT="${PORT:-8000}"

echo "Pulling ${IMAGE}..."
docker pull "${IMAGE}"

echo "Stopping existing container (if any)..."
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

echo "Starting ${CONTAINER_NAME}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${PORT}:8000" \
  -v "${DATA_VOLUME}:/data" \
  -v "${LOG_VOLUME}:/logs" \
  -e MMD_DATA_DIR=/data \
  -e LOG_DIR=/logs \
  "${IMAGE}"

echo "Deployed ${CONTAINER_NAME} at port ${PORT}."
