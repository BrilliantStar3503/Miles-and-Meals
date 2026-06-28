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

## 2026-06-28 (continued) - Automation 1 production hardening pass

- Fixed the watcher crash risk: `fs.watch` errors are now caught, logged, retried with bounded backoff, and reported with a clear fatal message and restart instructions if recovery fails.
- Fixed an unhandled-rejection crash risk: failures in watcher-triggered runs are now caught and logged instead of crashing the process.
- Made `state.json` writes atomic (temp file + rename) and added recovery from a corrupted/unparsable state file.
- Made `Enhanced/` file writes atomic in the pass-through provider (temp file + rename, with cleanup on failure) to prevent partial files after a crash mid-copy.
- Fixed a silent validation gap where a file disappearing during the write-stability check would throw uncaught instead of being recorded as invalid.
- Added graceful `SIGINT`/`SIGTERM` handling in the CLI: the watcher is closed and any in-flight run is awaited before exit.
- Added 5 new tests (14/14 total passing) covering all of the above.
- Updated `docs/FEATURES/automation-1.md` and `docs/OPERATOR_GUIDE.md`.
- No workflow, folder structure, or functionality changed. No AI provider integrated. Automation 2 not started.

## 2026-06-28 (continued) - Automation 2 implementation

- Implemented `src/automation2/`: config, file manager, validator, queue, logger, state store, watcher, posting-package generator, and pipeline orchestration for `init`, `run`, `status`, and `watch`. Built hardened from the start (watcher error handling with bounded retry, atomic state writes with corrupted-state recovery, atomic posting-package writes with cleanup on failure, graceful SIGINT/SIGTERM shutdown).
- Automation 2 watches only `Instagram Ready/` and generates one Markdown posting package per image in a new `Posting Package/` folder: draft caption with a `Location: __________` placeholder, reusable hashtag set, filename-derived ALT text draft, posting checklist, and a processing log entry. Every package states it is a draft and that nothing was published or connected to Instagram.
- Never overwrites an existing posting package; never modifies the original image; never publishes; never connects to Instagram; preserves the existing folder structure (only adds `Posting Package/` and `.automation2/`).
- Added CLI commands `automation2:init`, `automation2:run`, `automation2:status`, `automation2:watch` and matching `npm run` scripts; added `.env.example` entries for Automation 2 configuration.
- Added `test/automation2.test.js` (9 tests, all passing); `npm test` now passes 23/23 total across all three test files.
- Verified against the real production Media Workspace (`~/Miles and Meals PH`) using synthetic test data only; confirmed no existing folder or file was touched; cleaned up afterward.
- Added `docs/FEATURES/automation-2.md`; updated `docs/ARCHITECTURE.md`, `README.md`, and `docs/OPERATOR_GUIDE.md` (expanded to cover both automations).
- Automation 1 was not modified and remains frozen.

## 2026-06-28 (continued) - Replace the Pass-through provider with a real AI enhancement provider

- Added `src/automation1/providers/enhancement-profile.js` defining the official Miles & Meals Natural Travel Enhancement Profile (a Cloudinary transformation chain using only deterministic, non-generative correction effects: automatic AI-driven exposure/white-balance/dynamic-range correction plus capped contrast/color/vibrance/sharpening).
- Added `src/automation1/providers/cloudinary-provider.js` (`CloudinaryEnhancementProvider`, registered as `"cloudinary"`): signs and uploads the candidate photo to Cloudinary, applies the enhancement profile, downloads the result, writes it atomically into `Enhanced/`, and deletes the temporary cloud copy by default afterward.
- Made `"cloudinary"` the default Automation 1 enhancement provider (`AUTOMATION1_ENHANCEMENT_PROVIDER`, previously `"passthrough"`). `PassthroughEnhancementProvider` remains registered as `"passthrough"`, an explicit offline/no-credentials fallback.
- `pipeline.js`'s `processFile` now passes `mediaId` into `provider.enhance(...)`; this is the only change to the pipeline itself.
- Added Cloudinary configuration to `.env.example`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER`, `CLOUDINARY_ENHANCEMENT_TRANSFORMATION`, `CLOUDINARY_DELETE_AFTER_DOWNLOAD`. No credentials are hardcoded anywhere in source.
- Updated `test/automation1.test.js`: pinned 3 pre-existing tests to `provider: "passthrough"` (pipeline behavior is provider-agnostic), updated the default-provider assertion to `"cloudinary"`, and added 4 new tests covering missing-credentials error handling, a full mocked upload/transform/download round trip, and non-fatal cleanup-failure handling. Cloudinary's HTTP API is mocked via `globalThis.fetch`; no real network access or credentials are required to run the suite.
- `npm test`: 27/27 passing (15 in `automation1.test.js`, 9 in `automation2.test.js`, 3 in `content-factory.test.js`).
- Verified against the real production Media Workspace (`~/Miles and Meals PH`, which now holds real creator photos from genuine prior use): confirmed the 6 existing enhanced photos were correctly skipped and untouched, and a synthetic test file failed cleanly with the expected missing-credentials error; cleaned up the synthetic entry surgically afterward.
- Updated `docs/FEATURES/automation-1.md`, `docs/ARCHITECTURE.md`, `README.md`, and `docs/OPERATOR_GUIDE.md` to document the new provider, the enhancement profile, and Cloudinary setup/cost.
- Automation 2 was not modified.
