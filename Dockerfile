# Multi-stage: build frontend, then serve with Python backend
# Apache-2.0 - mmdGenerator

# ---- Frontend ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Backend ----
FROM python:3.11-slim AS backend
# Link image to repo so the package appears under the repo's Packages sidebar
LABEL org.opencontainers.image.source=https://github.com/markusbrand/mmdGenerator
WORKDIR /app

# Cairo, fontconfig and fonts for cairosvg (PNG/PDF export); fontconfig required for Cairo to find fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    fontconfig \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -fv

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Copy built frontend into backend's static path
COPY --from=frontend /app/frontend/dist /app/static

ENV MMD_STATIC_PATH=/app/static
ENV LOG_DIR=/logs
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
