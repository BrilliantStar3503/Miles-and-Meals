# Project State

## Status

Automation 1 is feature-complete, validated against the production Media Workspace, and has now received a production hardening pass (error handling, atomic writes, graceful shutdown). It is considered Production Ready for real travel use with the Pass-through enhancement provider. No paid AI enhancement provider has been integrated yet, and Automation 2 has not been started.

## Completed

- Implemented `src/automation1/` covering config, validation, processing queue, file management, structured logging, JSON state, folder watching, and pipeline orchestration for `init`, `run`, `status`, and `watch`.
- Implemented the enhancement provider abstraction: `BaseEnhancementProvider` (`src/automation1/providers/base-provider.js`) and the default `PassthroughEnhancementProvider` (`src/automation1/providers/passthrough-provider.js`), plus a provider registry (`createProvider`/`registerProvider` in `src/automation1/providers/index.js`) so future providers (OpenAI, Topaz, Adobe Firefly, etc.) can be added without changing the workflow.
- Added CLI commands `automation1:init`, `automation1:run`, `automation1:status`, `automation1:watch` to `src/cli.js` and corresponding `npm run` scripts.
- Added `.env.example` documenting `AUTOMATION1_MEDIA_ROOT`, `AUTOMATION1_ENHANCEMENT_PROVIDER`, `AUTOMATION1_QUEUE_CONCURRENCY`, and `AUTOMATION1_STABILITY_CHECK_MS`.
- Verified the production Media Workspace (`~/Miles and Meals PH`), created the required folders without modifying any existing media, and validated the watcher end-to-end using synthetic test data only.
- Added `docs/OPERATOR_GUIDE.md` for day-to-day field use.
- **Production hardening pass (this session):**
  - `src/automation1/watcher.js` now attaches an `error` handler to the underlying `fs.watch` instance: errors are logged, the watcher retries with a fixed delay up to 5 attempts, and if retries are exhausted it stops and prints a clear console message explaining what happened and how to restart it (`npm run automation1:watch`). The process is never crashed by a watcher error.
  - Runs triggered by the watcher are now wrapped so a failure is logged instead of becoming an unhandled promise rejection (which previously could have crashed the whole `automation1:watch` process even though `fs.watch` itself didn't error).
  - `src/automation1/state-store.js` now writes state atomically (temp file + rename) and recovers from a corrupted/unparsable `state.json` by backing it up to `state.json.corrupt-<timestamp>` and continuing with empty state, instead of crashing on the next run.
  - `src/automation1/providers/passthrough-provider.js` now copies to a temp file and renames it into place, with cleanup of the temp file on failure, so a crash mid-copy can never leave a partial file under the final filename (which duplicate-detection relies on).
  - `src/automation1/validator.js` now catches errors during the write-stability check (e.g. a file disappearing mid-check) and reports the file as invalid instead of throwing an uncaught error that silently dropped the file from all counts.
  - `src/cli.js` now handles `SIGINT` and `SIGTERM` exactly once each, closes the watcher, and awaits any in-flight run before exiting, so Ctrl+C cannot interrupt a photo mid-copy. A process-level `unhandledRejection` logger was added for the `automation1:watch` command as a defense-in-depth safety net.
  - Added 5 new tests (`test/automation1.test.js`, 14/14 passing total) covering atomic state writes, corrupted-state recovery, pass-through provider temp-file cleanup on failure, watcher error/retry behavior, and `watchAutomation1` surviving a failing run without crashing.
  - Manually re-verified against the real production workspace (`~/Miles and Meals PH`) after hardening: `automation1:run` still behaves correctly and the workspace remains clean; manually verified `SIGINT` shutdown against a scratch directory exits cleanly (exit code 0) with a clear "Watcher stopped" message.
  - Updated `docs/FEATURES/automation-1.md` and `docs/OPERATOR_GUIDE.md` to document the hardening.

## Work In Progress

- No active implementation work is currently in progress. Automation 1 is intentionally frozen pending real-world usage (see Next Steps).

## Known Issues / Remaining Limitations

- The enhancement provider is intentionally the Pass-through provider; no real AI enhancement (OpenAI, Topaz, Adobe Firefly, or other) is integrated yet.
- Automation 1 only watches `Instagram Candidates/`, not `RAW/`; RAW-to-candidate selection remains a manual/creative step, consistent with the Core Principle.
- Scene intelligence, preset recommendation, and draft generation (Automation 2 concerns) still live only in the older `src/content-factory/` development scaffold and have not been ported to operate against the production Media Workspace.
- The event log (`.automation1/logs/events.ndjson`) grows unbounded with no rotation; not an issue for a single trip, but worth revisiting if Automation 1 runs continuously for a long time.
- Watcher retry/backoff is a fixed delay with a fixed retry count (5 retries, 1s apart); no exponential backoff or configurability. Acceptable for now, but a future hardening pass could make this configurable if real-world watcher errors turn out to be frequent.
- No hosted database, queue, dashboard, or deployment target has been selected yet.

## Priorities

1. Use Automation 1 for real travel content and let real-world usage surface any further issues before making more changes (see Next Steps — Automation 1 is intentionally frozen for now).
2. When ready, select and integrate a real AI enhancement provider (e.g. OpenAI, Topaz, Adobe Firefly) behind the existing `BaseEnhancementProvider` abstraction.
3. Port Automation 2 (caption draft, hashtags, ALT text, posting package, manual review) to operate against the production Media Workspace the way Automation 1 now does.
4. Add EXIF and GPS extraction to Automation 1.
5. Prototype the approval dashboard for manual review (Automation 2).

## Next Steps

- Automation 1 is feature-complete, validated, and hardened. Recommendation: freeze further Automation 1 changes until real-world travel usage reveals concrete issues — avoid speculative additional hardening.
- Continue using `.project-memory/` as the handover source for every future session.
- Before implementing new automation, confirm any new feature fits within Automation 1 (stops at Lightroom Ready) or Automation 2 (stops at manual review/publish) as defined in `docs/ARCHITECTURE.md`.
- When integrating a real enhancement provider, implement it as a new `BaseEnhancementProvider` subclass and register it via `registerProvider`; do not modify `src/automation1/pipeline.js` to special-case a provider.
