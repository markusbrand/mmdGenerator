# Development

## Prerequisites

- Node 20+ (frontend)
- Python 3.11+ (backend)
- System libraries for Cairo (backend export): e.g. `libcairo2`, `libpango-1.0-0`, `libpangocairo-1.0-0` (Debian/Ubuntu)

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- OpenAPI: http://localhost:8000/docs
- Data and logs: `data/` and `logs/` in backend dir (or set `MMD_DATA_DIR`, `LOG_DIR`)

### Tests

```bash
cd backend
pytest tests/ -v
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Vite proxies `/api` to `http://localhost:8000` so the app talks to the local backend.

### Build

```bash
npm run build
```

Output in `frontend/dist/`.

## Full stack (Docker)

```bash
docker-compose up --build
```

Then open http://localhost:8000 (single container serves both API and frontend).
