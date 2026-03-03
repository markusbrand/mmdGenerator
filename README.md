# mmdGenerator

A simplified Mermaid diagram editor and exporter: edit `.mmd` files, preview live, and export to high-resolution PNG or PDF. Runs as a single Docker container (e.g. on Raspberry Pi 5) and is fully open source.

## Features

- **Code + preview**: Split view with Mermaid code on the left and live diagram on the right
- **Upload / save / download**: Upload `.mmd` files, edit in the code panel, save to the server, or download as `.mmd`
- **Export**: Download the diagram as PNG (high resolution) or PDF
- **Interactive diagram**: Pan (drag) and zoom (mouse wheel) on the preview
- **Diagram types and themes**: Flowchart, sequence, class, Gantt, timeline, mindmap, pie, and more; multiple Mermaid themes
- **i18n**: German and English
- **Dark / light mode**: Default dark; theme applies to both UI and diagram
- **Persistence**: One diagram per `.mmd`; stored on the server

## Quick start

### With Docker (recommended)

```bash
docker build -t mmdgenerator .
docker run -d -p 8000:8000 \
  -v mmd-data:/data -v mmd-logs:/logs \
  -e MMD_DATA_DIR=/data -e LOG_DIR=/logs \
  mmdgenerator
```

Open http://localhost:8000

### With docker-compose

```bash
docker-compose up -d
```

### Local development

**Backend**

```bash
cd backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt
# Install system Cairo (e.g. Ubuntu: sudo apt install libcairo2 libpango-1.0-0 libpangocairo-1.0-0)
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api` to the backend. Open http://localhost:5173

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please update documentation when you change behavior or setup.
