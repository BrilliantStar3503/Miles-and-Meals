# Architecture

## Project Overview

This repository is the long-term source of truth for Miles & Meals, a premium travel brand and AI-assisted content production ecosystem.

## Core Principle

AI automates repetitive work. The creator retains all creative decisions.

## Human Responsibilities

- Photography
- Videography
- Lightroom editing
- CapCut editing
- Storytelling
- Brand voice
- Publishing approval

## AI Responsibilities

- Watch folders
- Validate media
- Natural AI enhancement
- Organize files
- Scene detection
- Metadata generation
- Caption drafts
- Hashtags
- ALT text
- Logging

## Automation Roadmap

### Automation 1

```text
RAW
  -> AI Enhancement
  -> Enhanced
  -> Manual Lightroom Editing
  -> Lightroom Ready
```

Automation stops here. Lightroom editing is a human responsibility.

### Automation 2

```text
Lightroom Ready / Instagram Ready
  -> Caption Draft
  -> Hashtags
  -> ALT Text
  -> Posting Package
  -> Manual Review
  -> Manual Publish
```

Nothing publishes automatically. A human always reviews and publishes.

## Storage

- **Development Repository** (`Miles-and-Meals`) - this repository. Contains code, documentation, automation, and project memory.
- **Media Workspace** (`Miles and Meals PH`) - a separate location containing photos, videos, Lightroom assets, CapCut projects, and published media. Not part of this repository.

Automation 1 reads from and writes to the Media Workspace directly (`~/Miles and Meals PH` by default, overridable via `AUTOMATION1_MEDIA_ROOT` or `--root`). It also stores its own runtime state and logs inside the Media Workspace, under `.automation1/`, rather than inside this repository. No production media, Automation 1 state, or Automation 1 logs are ever committed to this repository.

## Current Technology

- Runtime: Node.js 22+ using built-in modules only.
- CLI: `src/cli.js`.
- Tests: Node.js built-in test runner.
- Documentation: Markdown.
- Data templates: CSV, JSON, and Markdown.
- Repository memory: `.project-memory/`.
- Local factory workspace: `content-factory/` (development-time stand-in for the Media Workspace, used by the original content-factory MVP commands).
- Automation 1 implementation: `src/automation1/` (operates against the production Media Workspace, `~/Miles and Meals PH` by default).
- Generated deliverables: `outputs/`.
- Scratch or intermediate work: `work/`.

No frontend framework, hosted database, queue, cloud deployment target, or paid AI enhancement provider has been selected yet.

## Automation 1 Implementation

Automation 1 is implemented in `src/automation1/` as a modular pipeline:

- `config.js` - resolves the Media Workspace root, enhancement provider name, queue concurrency, and stability-check timing from CLI options or environment variables (see `.env.example`).
- `file-manager.js` - creates Automation 1 folders and lists candidate files.
- `validator.js` - rejects unsupported extensions, empty files, and files still being written (size-stability check).
- `queue.js` - a bounded-concurrency processing queue.
- `providers/base-provider.js` - abstract `BaseEnhancementProvider` that all enhancement providers implement.
- `providers/passthrough-provider.js` - the default `PassthroughEnhancementProvider`; copies the candidate file into `Enhanced/` unmodified.
- `providers/index.js` - a provider registry (`createProvider`, `registerProvider`) so a future provider (OpenAI, Topaz, Adobe Firefly, etc.) can be added by registering a new `BaseEnhancementProvider` subclass, without changing `pipeline.js` or any other workflow code.
- `logger.js` - structured JSON-line logging to `.automation1/logs/events.ndjson` inside the Media Workspace, mirrored to the console.
- `state-store.js` - per-media JSON state persisted to `.automation1/state.json` inside the Media Workspace.
- `watcher.js` - debounced `fs.watch` on `Instagram Candidates/` for continuous mode.
- `pipeline.js` - orchestrates validation, the processing queue, the enhancement provider, file management, logging, and state for `init`, one-shot `run`, `status`, and continuous `watch`.

CLI commands:

```bash
npm run automation1:init
npm run automation1:run
npm run automation1:status
npm run automation1:watch
```

All commands accept `--root <path>` to target a different Media Workspace (used by tests to target a temporary directory instead of production media).

## Project Structure

```text
docs/
  ARCHITECTURE.md
  DATABASE.md
  FEATURES/

src/
  cli.js
  content-factory/
  automation1/
    config.js
    file-manager.js
    validator.js
    queue.js
    logger.js
    state-store.js
    watcher.js
    pipeline.js
    providers/
      base-provider.js
      passthrough-provider.js
      index.js

test/
  content-factory.test.js
  automation1.test.js

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
- The enhancement adapter is currently `local-passthrough`, which copies originals without modifying pixels. A future "natural AI enhancement" adapter must preserve the same authenticity boundary: it may correct exposure, color, and composition cues, but it must not invent scenery, fabricate edits, or alter the substance of a photo.
- Runtime media, generated drafts, and local state are ignored by git by default.
- `content-factory/` in this repository is a local development workspace, not the production Media Workspace. The production Media Workspace is `Miles and Meals PH`, outside this repository.

## Coding Conventions

- Prefer simple, production-quality implementation over unnecessary frameworks.
- Follow existing patterns before adding new abstractions.
- Keep documentation synchronized with implementation.
- Record significant decisions in `.project-memory/DECISIONS.md`.
- Add focused tests for behavior with meaningful risk.
- Keep pipeline stages modular and replaceable.
- Do not auto-publish content; generated content remains a draft until human approval.
- Automation stops at Lightroom Ready in Automation 1, and at the posting package in Automation 2. Do not automate Lightroom editing, CapCut editing, storytelling, brand voice decisions, or publishing.
