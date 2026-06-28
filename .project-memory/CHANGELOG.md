# Changelog

## 2026-06-27

- Initialized Repository Memory structure.
- Added project architecture documentation.
- Added database status documentation.
- Added feature documentation for Repository Memory.
- Added feature documentation for the Miles & Meals Starter Kit.
- Added AI agent workflow guide.
- Recorded initial project state, decisions, backlog, and session handover.
- Preserved the Miles & Meals Starter Kit deliverable under `outputs/`.
- Initialized git repository and created the initial local commit.
- Configured GitHub remote `origin` for `https://github.com/BrilliantStar3503/Miles-and-Meals.git`.
- Pushed `main` to GitHub.
- Added first executable AI Content Factory MVP.
- Added Node.js CLI commands: `factory:init`, `factory:run`, and `factory:status`.
- Added local content factory folders.
- Added RAW import, passthrough enhancement records, scene intelligence, preset recommendation, and content draft generation.
- Added tests for the content factory pipeline.
- Added `.gitignore` protections for creator media and runtime state.
- Pushed the AI Content Factory MVP to GitHub.

## 2026-06-28

- Realigned `README.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, and `docs/FEATURES/ai-content-factory.md` with the current Miles & Meals vision.
- Documented the Core Principle: AI automates repetitive work; the creator retains all creative decisions.
- Documented the Human Responsibilities and AI Responsibilities lists.
- Documented the two-stage Automation Roadmap (Automation 1 stops at Lightroom Ready; Automation 2 stops at manual review/manual publish).
- Documented the Development Repository (`Miles-and-Meals`) vs. Media Workspace (`Miles and Meals PH`) storage model.
- Recorded the corresponding decisions in `.project-memory/DECISIONS.md`.
- Updated `.project-memory/PROJECT_STATE.md` and `.project-memory/SESSION_HANDOVER.md` to reflect the realignment.
- No application code was changed in this update.
- Implemented the complete Automation 1 framework in `src/automation1/`: configuration, folder watcher, validation, processing queue, file manager, structured logging, JSON state, and pipeline orchestration.
- Implemented the enhancement provider abstraction (`BaseEnhancementProvider`) and the default `PassthroughEnhancementProvider`, with a registry (`createProvider`/`registerProvider`) for future providers.
- Added CLI commands `automation1:init`, `automation1:run`, `automation1:status`, `automation1:watch` and matching `npm run` scripts.
- Added `.env.example` for Automation 1 environment configuration and added `.env` to `.gitignore`.
- Added `test/automation1.test.js` (6 tests, all passing) covering initialization, pass-through enhancement, invalid-file rejection, idempotent re-runs, and future-provider registration.
- Documented Automation 1 in `docs/ARCHITECTURE.md` and a new `docs/FEATURES/automation-1.md`, and updated `README.md` with the new commands.
- Recorded the corresponding decisions in `.project-memory/DECISIONS.md`.
- No paid AI enhancement provider was integrated; Automation 1 uses the Pass-through provider only.
- Verified the production Media Workspace (`~/Miles and Meals PH`) and created the required folder structure (`Trips/`, `Instagram Candidates/`, `Enhanced/`, `Lightroom Ready/`, `Instagram Ready/`, `.automation1/`) without modifying any existing media.
- Verified the Automation 1 watcher end-to-end against the real production workspace using a synthetic test file only; cleaned up the synthetic file and reset state/logs afterward.
- Added `docs/OPERATOR_GUIDE.md` for day-to-day field use of Automation 1.
- Identified and documented (not fixed) a missing `error` handler on `fs.watch` in `src/automation1/watcher.js` that could crash `automation1:watch` if the watched folder becomes briefly unavailable.
