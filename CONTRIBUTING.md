# Contributing to mmdGenerator

Thank you for considering contributing. Please follow these guidelines.

## Requirements

- When you change user- or developer-facing behavior (API, UI, deployment, or setup), **update the relevant documentation** in the same PR (e.g. README, `docs/`).
- Code should be human-readable and follow existing patterns. Backend: Python with type hints; frontend: React + TypeScript.
- Run tests and lint before submitting.

## Workflow

1. Fork the repository and create a branch from `master` (or `main`).
2. Make your changes; update docs if behavior or setup changes.
3. Run backend tests: `cd backend && python -m pytest tests/ -v`
4. Run frontend build: `cd frontend && npm run build`
5. Open a pull request. Describe what changed and why.
6. CI will run tests and checks. Address any failures.

## Code style

- **Backend**: Ruff and Black can be used for formatting/lint. Prefer type hints and clear names.
- **Frontend**: ESLint and Prettier. Follow existing component and API patterns.
- **Logging**: Use the app logger; keep error messages clear and visible in logs.

## Security

Do not commit secrets or credentials. Report security issues privately if needed.
