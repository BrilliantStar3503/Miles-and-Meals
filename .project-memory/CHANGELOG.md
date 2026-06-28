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

## 2026-06-28 (continued) - Refine the Natural Travel Enhancement Profile for consistency and a premium look

- Retuned `src/automation1/providers/enhancement-profile.js` to v1.1: `e_auto_contrast`/`e_auto_color` capped at 20 (was 25), `e_vibrance` raised to 22 (was 20), and `e_sharpen:40` replaced with `e_unsharp_mask:60` for crisper, lower-halo-risk detail.
- Documented why the "auto" components produce brand consistency (they normalize each photo toward a shared target tonal range rather than applying a fixed offset, which would amplify pre-existing variance between photos) and added an explicit scene-coverage table mapping each of the brief's named scene categories to the transformation component(s) that address it.
- Added a guardrail test asserting the transformation chain contains only recognized non-generative effect prefixes and fails if a generative-effect prefix is ever introduced.
- Updated `docs/FEATURES/automation-1.md`'s enhancement-profile section to match.
- No change to the provider abstraction, the pipeline, or the default/registered providers. `npm test`: 28/28 passing.

## 2026-06-28 (continued) - Real-world Cloudinary verification; Automation 1 frozen

- Verified the Cloudinary enhancement provider against a real Cloudinary account (credentials provided by the user) and 6 real travel photos, using an isolated scratch copy so production data was never touched.
- Found and fixed three bugs in `src/automation1/providers/cloudinary-provider.js`: (1) the upload signature omitted the `eager` parameter, causing every real upload to fail with `401 Invalid Signature`; (2) a failed eager transformation silently fell back to the unmodified original and reported success, masking failures with no error logged; (3) the cleanup-deletion step used the wrong (non-folder-prefixed) public ID, so temporary cloud copies were never actually deleted, leaving 22 stray assets on the live account — manually cleaned up via the Cloudinary admin API.
- Found that `e_viesus_correct` (used since v1.0) requires a separate paid Cloudinary add-on subscription not active on the real account, which is what bug #2 was silently masking. Retuned the profile to **v1.2**, replacing `e_viesus_correct` with `e_improve` (a built-in Cloudinary effect requiring no add-on); confirmed via direct testing that no mode qualifier (`:indoor`/`:outdoor`) was needed.
- Ran the real 6-photo batch through the fixed provider and confirmed visually: richer-but-realistic sky/greenery only where already present, crisper architecture/stonework with no halos, preserved darkness in a dim interior, natural unfiltered skin tones in a portrait, and no HDR look, oversaturation, or hallucinated content in any photo.
- Added regression tests reproducing the silent-fallback bug and the folder-prefixed-destroy fix; updated the profile-content guardrail test for `e_improve`. `npm test`: 30/30 passing.
- Updated `docs/FEATURES/automation-1.md` with a new "Bugs Found and Fixed During Real Verification" section and v1.2 details.
- No change to the provider abstraction, pipeline, workflow, or folder structure — changes were limited to `enhancement-profile.js` and bug fixes inside `cloudinary-provider.js` itself, as required to make real verification possible at all.
- **Automation 1 is now frozen**, per explicit user instruction, following successful real-world validation.
- Tagged `v1.0.0` ("Miles & Meals Automation v1.0") and pushed to GitHub: first stable production release.

## 2026-06-29 - Fix `.env` not being loaded by npm scripts (launch-configuration bug)

- Diagnosed, before changing any code, why the user's real-world Automation 1 usage appeared not to use Cloudinary at all: a long-running `automation1:watch` process had started before the Cloudinary-default code change and had zero Cloudinary env vars in its actual process environment; confirmed via the live Cloudinary account that no real photo had ever been uploaded; confirmed via checksum that the most recent "enhanced" real photo was byte-identical to its original; measured a real Cloudinary round trip at ~14.0s vs. 9ms for a local copy.
- Root cause: none of the `automation1:*`/`automation2:*` npm scripts loaded `.env` — they ran plain `node src/cli.js ...`.
- Fix: added `node --env-file-if-exists=.env` to all 8 relevant scripts in `package.json`. Chose `--env-file-if-exists` over the requested `--env-file` because the latter hard-fails when `.env` is absent, which would regress every script for users without Cloudinary configured; `--env-file-if-exists` loads it when present and continues silently otherwise. No new dependency (dotenv) was introduced.
- Killed the stale watch process; verified `automation1:status`, `automation2:status`, and a live `automation1:watch` start/stop all report `provider: "cloudinary"` with zero extra flags.
- Performed one real, timed verification through the actual `npm run automation1:run` command against an isolated scratch copy of a real photo: confirmed genuine upload/transform/download (different bytes and checksum, ~12.6s elapsed, profile v1.2 recorded) and automatic cleanup of the temporary Cloudinary copy. Production data was untouched.
- `npm test`: 30/30 passing (no test changes needed; this was a launch-configuration fix, not application logic).
- Updated `docs/FEATURES/automation-1.md`'s Cloudinary Setup section with the auto-loading behavior and a note that running watchers must be restarted to pick up `.env` changes.
- No change to the enhancement profile, pipeline, provider abstraction, or folder structure.
