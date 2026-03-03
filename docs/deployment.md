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

### Raspberry Pi setup (for deploy workflow)

Do the following **on the Pi** (or from your PC via `ssh pi`).

1. **Install Docker** (if not already):
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
   Log out and back in so the `docker` group applies.

2. **Make the GHCR package public** (recommended — no login on the Pi)
   - On GitHub: go to **Your profile** (top-right) → **Packages**, or open the repo → **Packages** (right sidebar).
   - Open the **mmdgenerator** package (image: `ghcr.io/markusbrand/mmdgenerator`).
   - **Package settings** → **Danger Zone** (or **Change visibility**) → **Change visibility** → **Public**.
   - After this, the Pi can pull the image without `docker login`.  
   - *If you keep the package private:* on the Pi run `docker login ghcr.io` with a PAT that has `read:packages`.

3. **Allow GitHub Actions to SSH in**
   - On your **PC/repo**: In GitHub → repo **Settings → Secrets and variables → Actions**, add:
     - `SSH_HOST`: Pi hostname or IP (e.g. `raspberrypi` or `192.168.1.10`) that the runner can reach.
     - `SSH_USER`: Linux user on the Pi that can run Docker (e.g. `pi`).
     - `SSH_PRIVATE_KEY`: Private key content (no passphrase recommended for automation). The matching **public** key must be in the Pi user’s `~/.ssh/authorized_keys`.
   - On the **Pi**, ensure `~/.ssh` and `~/.ssh/authorized_keys` exist and have correct permissions (`chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`). Append the public key for the deploy key to `authorized_keys`.

4. **Verify**
   - From the Pi: `docker pull ghcr.io/markusbrand/mmdgenerator:0.0.1` (use your repo path; replace `0.0.1` with a real tag). It should pull without "denied".
   - After publishing a release, the **Deploy to Pi** workflow will SSH to the Pi, pull the new image, and start the container on port 8000.

### Deploy script (manual)

If you prefer to update the Pi manually or from a cron job, use the script on the Pi (clone the repo or copy the script):

```bash
export IMAGE_NAME=ghcr.io/YOUR_ORG/mmdgenerator
bash scripts/deploy-on-pi.sh [VERSION]
```

`VERSION` defaults to `latest`. The script pulls the image, stops/removes the existing container, and starts a new one with volumes for data and logs.
