# Project State

## Status

Automation 1 is feature-complete, validated, hardened, and frozen pending real-world usage. Automation 2 has now been implemented: it watches `Instagram Ready/` and generates draft posting packages (caption, hashtags, ALT text, checklist) in `Posting Package/`. Automation 2 never publishes and never connects to Instagram. No paid AI enhancement provider has been integrated, and no real image/vision analysis exists in either automation.

## Completed

### Automation 1 (frozen, Production Ready)

- Implemented `src/automation1/` (config, validation, processing queue, file management, structured logging, JSON state, folder watching, pipeline orchestration) with a `BaseEnhancementProvider` abstraction and the default `PassthroughEnhancementProvider`.
- Hardened for production: watcher error handling with bounded retry, atomic state writes with corrupted-state recovery, atomic enhanced-file writes with temp-file cleanup, validation-time error handling, and graceful `SIGINT`/`SIGTERM` shutdown.
- Verified against the real production Media Workspace (`~/Miles and Meals PH`) using synthetic test data only; 14 tests passing.
- See `.project-memory/SESSION_HANDOVER.md` history and `docs/FEATURES/automation-1.md` for full detail.

### Automation 2 (this session)

- Implemented `src/automation2/`, mirroring Automation 1's module shape and reliability standard from the start (not bolted on after the fact):
  - `config.js`, `file-manager.js`, `validator.js`, `queue.js`, `logger.js`, `state-store.js`, `watcher.js`, `pipeline.js`, `posting-package.js`.
  - Watches only `Instagram Ready/`. Lists all non-hidden files (not pre-filtered by extension) so unsupported files are still validated and counted as `invalid`, consistent with Automation 1's pattern.
  - Generates one Markdown posting package per image in a new `Posting Package/` folder, named after the image (e.g. `sunset-beach.jpg` -> `Posting Package/sunset-beach.md`).
  - Posting package contains: image filename/path, a draft caption with a `Location: __________` placeholder (never assumes a location, never invents an experience or fact), a small reusable hashtag set, ALT text explicitly labeled as a filename-based draft (Automation 2 does not analyze image content), a posting checklist (caption reviewed, location verified, hashtags reviewed, ALT text reviewed, image quality checked, ready to publish), and a processing log entry.
  - Every package ends with an explicit statement that it is a draft and that Automation 2 does not publish, does not connect to Instagram, and did not modify the image.
  - Reuses `SUPPORTED_IMAGE_EXTENSIONS` from `src/automation1/config.js` (a shared read-only constant); otherwise fully independent of `src/automation1/` so Automation 1 was not touched.
  - Hardened from the start: watcher error handling with bounded retry and a clear fatal/restart message, atomic state writes with corrupted-state recovery, atomic posting-package writes with temp-file cleanup on failure, and graceful `SIGINT`/`SIGTERM` shutdown that awaits in-flight work.
  - Never overwrites an existing posting package — `postingPackageExists()` is checked before generating; a pre-existing `.md` file is left untouched and counted as `skipped`.
  - `ensureDirectories()` only creates `Instagram Ready/` (if missing) and the new `Posting Package/` folder; no other folder is touched.
- Added CLI commands `automation2:init`, `automation2:run`, `automation2:status`, `automation2:watch` to `src/cli.js` and corresponding `npm run` scripts.
- Added `.env.example` entries for `AUTOMATION2_MEDIA_ROOT`, `AUTOMATION2_QUEUE_CONCURRENCY`, `AUTOMATION2_STABILITY_CHECK_MS`.
- Added `test/automation2.test.js` (9 tests) covering: folder creation, full posting-package content (caption/placeholder/hashtags/ALT text/checklist/log/disclaimer), never-overwrite behavior, invalid-file rejection, idempotent re-runs, atomic/corrupted state handling, posting-package write failure cleanup, and the watcher surviving a failing run without crashing.
- `npm test` passes 23/23 total: 11 in `automation1.test.js`, 9 in `automation2.test.js`, 3 in `content-factory.test.js`.
- Verified manually against the real production Media Workspace (`~/Miles and Meals PH`): ran `automation2:init` and a synthetic-file `automation2:run`, confirmed the generated Markdown package matched all requirements, confirmed no existing folder (`Trips/`, `Instagram Candidates/`, `Enhanced/`, `Lightroom Ready/`, `.automation1/`) was touched, and cleaned up the synthetic file/state/log afterward so the workspace remains empty and pristine.
- Added `docs/FEATURES/automation-2.md`; updated `docs/ARCHITECTURE.md`, `README.md`, and `docs/OPERATOR_GUIDE.md` (renamed to cover both automations) to document Automation 2.

## Work In Progress

- No active implementation work is currently in progress.

## Known Issues / Remaining Limitations

- Automation 1: Pass-through provider only, no real AI enhancement provider integrated yet.
- Automation 2: captions, hashtags, and ALT text are template-based and filename-derived only — there is no real image/vision analysis. This is intentional (the requirements explicitly forbid inferring or inventing anything not actually known), not a defect, but it means every posting package requires real human review before publishing, by design.
- Neither automation has log rotation; fine for normal trip-length usage, would need revisiting under sustained continuous operation.
- No hosted database, queue, dashboard, or deployment target has been selected yet.
- The older `src/content-factory/` scaffold (scene intelligence, preset recommendation, draft generation) still exists alongside both automations and has not been retired; it operates on the separate local `content-factory/` development workspace, not the production Media Workspace.

## Priorities

1. Use Automation 1 and Automation 2 for real travel content; let real-world usage surface concrete issues before further changes (both are intentionally frozen for now — see Next Steps).
2. When ready, select and integrate a real AI enhancement provider for Automation 1 behind the existing `BaseEnhancementProvider` abstraction.
3. If real image/vision analysis is ever added to Automation 2 (e.g. for ALT text or scene-aware captions), it must continue to follow the same authenticity rules: never invent a location, experience, or fact, and always leave room for human verification.
4. Decide whether/how to retire or merge the older `content-factory/` scaffold now that both automations operate directly against the production Media Workspace.

## Next Steps

- Automation 1 and Automation 2 are both feature-complete and validated. Recommendation: freeze further changes to both until real-world travel usage reveals concrete issues — avoid speculative additional work.
- Continue using `.project-memory/` as the handover source for every future session.
- Before implementing new automation, confirm any new feature fits within Automation 1 (stops at Lightroom Ready) or Automation 2 (stops at the posting package, never publishes) as defined in `docs/ARCHITECTURE.md`.
- When integrating a real enhancement provider for Automation 1, implement it as a new `BaseEnhancementProvider` subclass and register it via `registerProvider`; do not modify `src/automation1/pipeline.js` to special-case a provider.
