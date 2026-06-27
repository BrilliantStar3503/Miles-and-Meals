# Architecture

## Project Overview

This repository is the long-term source of truth for Miles & Meals, a premium travel brand and AI-assisted content production ecosystem.

The current repository contains the project memory system and the first generated deliverable: a Miles & Meals starter kit under `outputs/Miles_and_Meals_Starter_Kit/`.

## Current Technology

- Documentation: Markdown.
- Data templates: CSV and Markdown.
- Repository memory: `.project-memory/`.
- Generated deliverables: `outputs/`.
- Scratch or intermediate work: `work/`.

No application runtime, framework, package manager, database, or deployment target has been selected yet.

## Project Structure

```text
docs/
  ARCHITECTURE.md
  DATABASE.md
  FEATURES/

.project-memory/
  PROJECT_STATE.md
  SESSION_HANDOVER.md
  DECISIONS.md
  CHANGELOG.md
  BACKLOG.md
  AI_GUIDE.md

outputs/
  Miles_and_Meals_Starter_Kit/
  Miles_and_Meals_Starter_Kit.zip

work/
```

## Design Decisions

- Repository documentation is the permanent memory for all AI agents.
- Project state and future backlog are separated to avoid mixing active context with deferred ideas.
- Generated user-facing artifacts live in `outputs/`.
- Temporary or exploratory files belong in `work/`.

## Coding Conventions

No production code exists yet. When code is introduced:

- Prefer simple, production-quality implementation over unnecessary frameworks.
- Follow existing patterns before adding new abstractions.
- Keep documentation synchronized with implementation.
- Record significant decisions in `.project-memory/DECISIONS.md`.
- Add focused tests for behavior with meaningful risk.
