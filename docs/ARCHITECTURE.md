# Architecture

## Project Overview

This repository is the long-term source of truth for Miles & Meals, a premium travel brand and AI-assisted content production ecosystem.

The current repository contains the project memory system, the first generated deliverable, and the first executable AI Content Factory CLI scaffold.

## Current Technology

- Runtime: Node.js 24+ using built-in modules only.
- CLI: `src/cli.js`.
- Tests: Node.js built-in test runner.
- Documentation: Markdown.
- Data templates: CSV, JSON, and Markdown.
- Repository memory: `.project-memory/`.
- Local factory workspace: `content-factory/`.
- Generated deliverables: `outputs/`.
- Scratch or intermediate work: `work/`.

No frontend framework, hosted database, queue, cloud deployment target, or AI provider has been selected yet.

## Project Structure

```text
docs/
  ARCHITECTURE.md
  DATABASE.md
  FEATURES/

src/
  cli.js
  content-factory/

test/
  content-factory.test.js

content-factory/
  RAW/
  Enhanced/
  Lightroom Ready/
  CapCut Ready/
  Instagram Ready/
  Published/
  Archive/
  Templates/
  Music/
  Presets/
  Brand/
  Automation/
  Analytics/
  Logs/
  Drafts/
  Backups/

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
- The first executable implementation is a local Node.js CLI with no third-party dependencies.
- The enhancement adapter is currently `local-passthrough`, which copies originals without modifying pixels.
- Runtime media, generated drafts, and local state are ignored by git by default.

## Coding Conventions

- Prefer simple, production-quality implementation over unnecessary frameworks.
- Follow existing patterns before adding new abstractions.
- Keep documentation synchronized with implementation.
- Record significant decisions in `.project-memory/DECISIONS.md`.
- Add focused tests for behavior with meaningful risk.
- Keep pipeline stages modular and replaceable.
- Do not auto-publish content; generated content remains a draft until human approval.
- Preserve authenticity boundaries when adding AI adapters.
