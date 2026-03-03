---
name: mmd-qa
description: Quality assurance for mmdGenerator: security review and code quality (readable code, patterns, up-to-date deps). Use when implementing features, before PRs, or when the user asks for QA or security check.
---

# mmdGenerator QA

Apply this skill together with the **security-review** skill for full coverage.

## When to use

- After implementing or changing code (API, UI, export, deployment).
- When the user asks for a security check, QA, or code quality review.
- Before opening or merging a pull request.

## 1. Security

Follow the [security-review](/home/markus/.cursor/skills/security-review/SKILL.md) skill:

- Injection and input (no unsanitized user input in shell, SQL, paths).
- Auth and authorization (sensitive actions protected).
- No hardcoded secrets; use env or secrets manager.
- Validate and sanitize SVG and user content (export, storage).
- Security headers and CORS configured appropriately.

## 2. Code quality

- **Readable**: Clear names, small functions, comments where logic is non-obvious.
- **Patterns**: Use existing project patterns (e.g. FastAPI routers, React components, service layer).
- **Types**: Backend type hints; frontend TypeScript types for API and props.
- **Logging**: Use app logger; errors and important events are logged clearly.
- **Dependencies**: Prefer up-to-date, maintained libraries; avoid known vulnerable versions (check with `pip audit` / `npm audit`).

## 3. Output

Report findings in two parts:

1. **Security**: Use the security-review output format (Critical / High / Medium / Low) with concrete fixes.
2. **Quality**: List readability, pattern, or dependency issues and suggest changes.

Re-run checks after fixes until major issues are resolved. CI (tests, lint, Bandit, npm audit) should pass; the autofix workflow can create a PR for fixable lint/format issues.
