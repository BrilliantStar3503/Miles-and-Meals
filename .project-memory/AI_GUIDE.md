# AI Guide

This repository is the permanent source of truth for the project. Do not rely on prior chat history.

## Required Workflow

### Before Coding

1. Read `.project-memory/PROJECT_STATE.md`.
2. Read `.project-memory/SESSION_HANDOVER.md`.
3. Read `.project-memory/DECISIONS.md`.
4. Read relevant docs under `docs/`.
5. Inspect the existing implementation.

### During Development

- Prioritize implementation over unnecessary planning.
- Keep documentation synchronized with implementation.
- Record significant technical decisions in `.project-memory/DECISIONS.md`.
- Avoid duplicate documentation.
- Keep documentation concise and accurate.
- Prefer extending existing docs instead of creating overlapping files.
- Maintain clean, production-quality code.

### After Coding

1. Update `.project-memory/PROJECT_STATE.md`.
2. Update `.project-memory/SESSION_HANDOVER.md`.
3. Update `.project-memory/CHANGELOG.md`.
4. Commit changes.
5. Push changes when a remote is configured and available.

## Repository Conventions

- User-facing deliverables belong in `outputs/`.
- Temporary or exploratory work belongs in `work/`.
- Feature documentation belongs in `docs/FEATURES/`.
- Do not mix current project status with future backlog items.
- If a database is introduced, update `docs/DATABASE.md` with schema, relationships, migrations, indexes, constraints, and implementation notes.
