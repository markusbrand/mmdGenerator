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

On release (published), the workflow **Build and Deploy** (`build-push.yml`) runs two jobs in order:

1. **Build**: Builds the multi-arch image and pushes it to GitHub Container Registry (GHCR) with tags `:<version>` and `:latest`.
2. **Deploy**: Runs **only after the build job has finished successfully**, on a self-hosted runner on the Pi. The Pi then pulls the new image and runs the container. No SSH from the internet is needed.

### Raspberry Pi setup (for deploy workflow)

The Pi is only on your LAN (e.g. 192.168.0.150). GitHub-hosted runners cannot reach it, so deployment uses a **self-hosted runner on the Pi**: the Pi registers with GitHub and runs the deploy job itself. No SSH secrets required.

Do the following **on the Pi** (or from your PC via `ssh pi`).

1. **Install Docker** (if not already):
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
   Log out and back in so the `docker` group applies.

2. **Make the GHCR package public** (recommended — no login on the Pi)
   - On GitHub: repo → **Packages** (right sidebar) → **mmdgenerator** → **Package settings** → **Change visibility** → **Public**.
   - After this, the Pi can pull the image without `docker login`.

3. **Install the GitHub Actions self-hosted runner on the Pi**
   - On GitHub: repo **Settings** → **Actions** → **Runners** → **New self-hosted runner**.
   - Choose **Linux** and **ARM64** (for Raspberry Pi 5; use ARM64 or the architecture that matches your Pi).
   - Follow the commands shown (download, configure). When asked for additional labels you can press Enter (default labels `self-hosted`, `Linux`, `ARM64` are used by the workflow).
   - Run the runner as a service so it stays up after reboot (see below). Do not rely on `./run.sh` in a terminal—it stops when you log out.
   - The runner must be able to run `docker` (install it as the same user that’s in the `docker` group, e.g. `pi`).

   - **Install as a service** (so the runner keeps running after you log out or reboot):
     ```bash
     cd ~/actions-runner
     sudo ./svc.sh install    # installs the runner as a systemd service
     sudo ./svc.sh start      # starts it
     sudo ./svc.sh status     # check it's running
     ```
     To stop or uninstall later: `sudo ./svc.sh stop`, `sudo ./svc.sh uninstall`.

   **Security (public repo):** GitHub warns that self-hosted runners on public repos can run code from fork pull requests. This deploy workflow is **release-only** (`if: github.event_name == 'release'`), so it never runs on PRs. To stay safe: **do not use this runner in any other workflow that runs on `pull_request`** (e.g. keep CI on `ubuntu-latest`). If you prefer to avoid the warning entirely, use manual deploy with `scripts/deploy-on-pi.sh` instead of a self-hosted runner.

4. **Verify**
   - From the Pi: `docker pull ghcr.io/markusbrand/mmdgenerator:0.0.1` (replace with a real tag). It should pull without "denied".
   - After publishing a release, the **Deploy** job runs on the Pi runner (only after the image is in GHCR), pulls the new image, and starts the container on port 8000.

**Reachability (for using the app):** The app listens on port 8000. From your LAN use `http://192.168.0.150:8000`. If the Pi is on Tailscale (e.g. 100.103.56.22), you can use `http://100.103.56.22:8000` from any device on your tailnet. If you expose the app via Cloudflare Tunnel (cloudflared), use the public URL configured in the tunnel.

### Deploy script (manual)

If you prefer to update the Pi manually or from a cron job, use the script on the Pi (clone the repo or copy the script):

```bash
export IMAGE_NAME=ghcr.io/YOUR_ORG/mmdgenerator
bash scripts/deploy-on-pi.sh [VERSION]
```

`VERSION` defaults to `latest`. The script pulls the image, stops/removes the existing container, and starts a new one with volumes for data and logs.
