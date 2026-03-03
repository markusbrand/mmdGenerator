# Deployment

## Docker image

The image is built for **linux/amd64** and **linux/arm64** (e.g. Raspberry Pi 5). It serves the FastAPI backend and the built frontend static files on port 8000.

### Build locally

```bash
docker build -t mmdgenerator .
docker run -d -p 8000:8000 \
  -v mmd-data:/data -v mmd-logs:/logs \
  -e MMD_DATA_DIR=/data -e LOG_DIR=/logs \
  mmdgenerator
```

### GHCR and GitHub Actions

- **Build and push**: On release (published), the workflow `build-push.yml` builds the multi-arch image and pushes it to GitHub Container Registry (GHCR) with tags `:<version>` and `:latest`.
- **Deploy to Pi**: The workflow `deploy.yml` runs on release and SSHs to the Raspberry Pi (using `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` secrets). On the Pi it runs: pull the new image, stop/remove the old container, run the new container with the same volume and port.

### Pi setup

1. Install Docker on the Pi.
2. In the GitHub repo, add secrets: `SSH_HOST` (Pi hostname or IP), `SSH_USER`, `SSH_PRIVATE_KEY` (private key for SSH to the Pi).
3. On the Pi, log in to GHCR if the image is private: `docker login ghcr.io` (use a PAT with `read:packages`).
4. When you publish a release, the deploy workflow will run and update the container on the Pi.

### Deploy script (manual)

If you prefer to update the Pi manually or from a cron job, use the script on the Pi (clone the repo or copy the script):

```bash
export IMAGE_NAME=ghcr.io/YOUR_ORG/mmdgenerator
bash scripts/deploy-on-pi.sh [VERSION]
```

`VERSION` defaults to `latest`. The script pulls the image, stops/removes the existing container, and starts a new one with volumes for data and logs.
