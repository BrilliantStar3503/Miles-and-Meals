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

## Current Technology

- Runtime: Node.js 24+ using built-in modules only.
- CLI: `src/cli.js`.
- Tests: Node.js built-in test runner.
- Documentation: Markdown.
- Data templates: CSV, JSON, and Markdown.
- Repository memory: `.project-memory/`.
- Local factory workspace: `content-factory/` (development-time stand-in for the Media Workspace).
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
