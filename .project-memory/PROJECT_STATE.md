# Project State

## Status

Automation 1 has been implemented as a production-ready, modular framework operating against the production Media Workspace (`~/Miles and Meals PH` by default), using a temporary Pass-through enhancement provider. No paid AI enhancement provider has been integrated yet.

## Completed

- Implemented `src/automation1/` covering config, validation, processing queue, file management, structured logging, JSON state, folder watching, and pipeline orchestration for `init`, `run`, `status`, and `watch`.
- Implemented the enhancement provider abstraction: `BaseEnhancementProvider` (`src/automation1/providers/base-provider.js`) and the default `PassthroughEnhancementProvider` (`src/automation1/providers/passthrough-provider.js`), plus a provider registry (`createProvider`/`registerProvider` in `src/automation1/providers/index.js`) so future providers (OpenAI, Topaz, Adobe Firefly, etc.) can be added without changing the workflow.
- Added CLI commands `automation1:init`, `automation1:run`, `automation1:status`, `automation1:watch` to `src/cli.js` and corresponding `npm run` scripts.
- Added `.env.example` documenting `AUTOMATION1_MEDIA_ROOT`, `AUTOMATION1_ENHANCEMENT_PROVIDER`, `AUTOMATION1_QUEUE_CONCURRENCY`, and `AUTOMATION1_STABILITY_CHECK_MS`.
- Added `test/automation1.test.js` covering initialization, successful pass-through enhancement, rejection of unsupported/invalid files, idempotent re-runs, and registering a stub future provider.
- Confirmed Automation 1 stores no production media, state, or logs inside this repository: runtime state and logs live under `.automation1/` inside the Media Workspace, not the repository.
- Updated `README.md`, `docs/ARCHITECTURE.md`, and added `docs/FEATURES/automation-1.md` to document the implementation.
- Updated `.gitignore` to ignore `.env`.
- Verified `npm test` passes (9/9) and manually exercised the CLI against a temporary workspace.

## Work In Progress

- No active implementation work is currently in progress.

## Known Issues

- The enhancement provider is intentionally the Pass-through provider; no real AI enhancement (OpenAI, Topaz, Adobe Firefly, or other) is integrated yet.
- Automation 1 only watches `Instagram Candidates/`, not `RAW/`; RAW-to-candidate selection remains a manual/creative step, consistent with the Core Principle.
- Scene intelligence, preset recommendation, and draft generation (Automation 2 concerns) still live only in the older `src/content-factory/` development scaffold and have not been ported to operate against the production Media Workspace.
- No hosted database, queue, dashboard, or deployment target has been selected yet.
- `automation1:watch` has not been run continuously against a real production folder in this session; it has been exercised via its one-shot `run` path and unit tests only.

## Priorities

1. Select and integrate a real AI enhancement provider (e.g. OpenAI, Topaz, Adobe Firefly) behind the existing `BaseEnhancementProvider` abstraction.
2. Port Automation 2 (caption draft, hashtags, ALT text, posting package, manual review) to operate against the production Media Workspace the way Automation 1 now does.
3. Add EXIF and GPS extraction to Automation 1.
4. Prototype the approval dashboard for manual review (Automation 2).

## Next Steps

- Continue using `.project-memory/` as the handover source for every future session.
- Before implementing new automation, confirm any new feature fits within Automation 1 (stops at Lightroom Ready) or Automation 2 (stops at manual review/publish) as defined in `docs/ARCHITECTURE.md`.
- When integrating a real enhancement provider, implement it as a new `BaseEnhancementProvider` subclass and register it via `registerProvider`; do not modify `src/automation1/pipeline.js` to special-case a provider.
