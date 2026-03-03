# mmdGenerator – QA Report

Generated from a full codebase pass using the [mmd-qa](.cursor/skills/mmd-qa/SKILL.md) and [security-review](~/.cursor/skills/security-review/SKILL.md) skills.

---

## 1. Security Review

### Critical

- *None.*

### High

- *None.*

### Medium

- **CORS default `*`** (`backend/app/core/config.py`)  
  `cors_origins` defaults to `"*"`, which allows any origin. Acceptable for local/dev; in production this can enable unwanted cross-origin access.  
  **Fix:** Document in deployment docs that production should set `MMD_CORS_ORIGINS` to specific origins (e.g. `https://yourdomain.com`). Optional: reject `*` when a non-dev environment is detected.

- **No rate limiting on export** (`backend/app/api/export.py`)  
  PNG/PDF export is CPU-heavy. A client can send many large SVGs and stress the server.  
  **Fix:** Add rate limiting (e.g. slowapi or custom middleware) for `/api/export/*`, or document as accepted risk for single-tenant / internal deployments.

- **Request body size for diagram content** (`backend/app/models/diagram.py`)  
  `mmd_content` had no max length; a very large POST/PUT could be used for DoS.  
  **Fix:** Enforce a max length (e.g. 1 MB) on `mmd_content` in `DiagramCreate` and `DiagramUpdate` (implemented in this pass).

### Low / Info

- **No authentication** (by design)  
  All API endpoints are unauthenticated. Document as intentional for the current “single-user / local” scope; if the app is ever exposed multi-tenant, add auth.

- **SVG via `innerHTML` in frontend** (`frontend/src/components/DiagramView.tsx`)  
  Rendered SVG from Mermaid is inserted with `el.innerHTML = svgStr`. Mermaid is a trusted dependency and typically emits safe SVG; risk is low.  
  **Fix (optional):** For defense-in-depth, sanitize SVG on the client (e.g. DOMPurify with SVG allowed) before assignment, or use a dedicated SVG sanitizer.

- **Error messages**  
  API returns generic messages (e.g. “Diagram not found”, “SVG could not be converted to PNG”); no stack traces or paths are exposed. Good.

### Checklist summary

- [x] **Injection & input:** Parameterized SQL (aiosqlite); no shell/path from user input; SVG sanitized (script/href stripped) in export; diagram ID is UUID from path.
- [x] **Auth:** No auth by design; documented as limitation for production.
- [x] **Secrets:** No hardcoded secrets; GitHub Actions use `secrets.*`; config from env.
- [x] **Data / serialization:** No sensitive data in logs; export errors are generic.
- [x] **Web / UI:** SVG from Mermaid only; export sanitizes SVG; CORS configurable.
- [x] **Dependencies:** `npm audit` 0 vulnerabilities; pip audit not run (use `pip-audit` if available).
- [ ] **Rate limiting:** Not implemented; recommended for export in multi-tenant use.
- [x] **Errors:** No internal leakage to clients.

---

## 2. Code Quality

- **Readable:** Clear module and function names; small, focused functions; comments where useful (e.g. export sanitization, logging config).
- **Patterns:** FastAPI routers, service layer, Pydantic models; React components and API client are consistent with the stack.
- **Types:** Backend uses type hints; frontend uses TypeScript and typed API interfaces.
- **Logging:** Central `logging_config`; log levels and rotating file (e.g. 40 MB) configured; important actions (create/update diagram, export failures) logged; no sensitive data in logs.
- **Dependencies:** Backend and frontend use current, maintained libraries; no known vulnerable versions reported by npm audit.

### Minor suggestions

- **Backend:** Consider adding `pip-audit` (or similar) to CI for Python dependency checks.
- **Frontend:** DiagramView’s `innerHTML` use is acceptable; optional hardening with SVG sanitization if you want extra assurance.

---

## 3. Tests and CI

- Backend: 8 tests passed (diagrams API, export service, sanitization, size limit).
- CI: backend tests, Ruff, Bandit, frontend build, ESLint, Docker build (Bandit/Ruff/ESLint with continue-on-error).

---

## 4. Applied Fixes (this pass)

- **`mmd_content` max length:** Added `max_length=1_048_576` (1 MB) to `DiagramCreate.mmd_content` and `DiagramUpdate.mmd_content` in `backend/app/models/diagram.py` to limit request body size and reduce DoS risk.

---

Re-run this QA after major changes or before releases. Address Medium items for production deployments (CORS, optional rate limiting) and consider Low/Info items for defense-in-depth.
