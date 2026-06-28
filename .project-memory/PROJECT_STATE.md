# Project State

## Status

Automation 1's Pass-through provider has been replaced as the default enhancement provider by a real AI enhancement provider: `CloudinaryEnhancementProvider`, implementing the official **Miles & Meals Natural Travel Enhancement Profile** (now refined to v1.1 for visual consistency and a more premium Lightroom-style finish). `PassthroughEnhancementProvider` remains registered as an offline/no-credentials fallback. The provider abstraction (`BaseEnhancementProvider`, `createProvider`/`registerProvider`) and the rest of the Automation 1 pipeline were not changed. Automation 2 is unaffected and remains as previously implemented (template-based, no image analysis).

## Completed

### Automation 1 (Production Ready; Pass-through replaced with a real provider this session)

- Implemented `src/automation1/` (config, validation, processing queue, file management, structured logging, JSON state, folder watching, pipeline orchestration) with a `BaseEnhancementProvider` abstraction.
- Hardened for production: watcher error handling with bounded retry, atomic state writes with corrupted-state recovery, atomic enhanced-file writes with temp-file cleanup, validation-time error handling, and graceful `SIGINT`/`SIGTERM` shutdown.
- **This session:** added `src/automation1/providers/cloudinary-provider.js` (`CloudinaryEnhancementProvider`, registered as `"cloudinary"`) and made it the default provider (`AUTOMATION1_ENHANCEMENT_PROVIDER` defaults to `"cloudinary"` in `src/automation1/config.js`, previously `"passthrough"`).
  - Added `src/automation1/providers/enhancement-profile.js` defining the official **Miles & Meals Natural Travel Enhancement Profile**: a Cloudinary transformation chain (`e_viesus_correct/e_auto_contrast:25/e_auto_color:25/e_vibrance:20/e_sharpen:40`) using only deterministic, per-pixel correction effects — no generative/diffusion effects. This is a structural guarantee, not just an instruction: the profile cannot crop, replace the sky, change weather, add/remove people or buildings, invent scenery, hallucinate details, or change the location, because none of the effects used are capable of adding image content that wasn't already in the original photo.
  - `CloudinaryEnhancementProvider.enhance()`: signs and uploads the candidate photo to the user's Cloudinary account, applies the enhancement profile as an eager transformation, downloads the result, writes it atomically (temp file + rename) into `Enhanced/`, then deletes the temporary cloud copy by default (`CLOUDINARY_DELETE_AFTER_DOWNLOAD=true`) so creator media isn't retained on a third-party service. Cleanup-deletion failures are logged as warnings only and do not fail the overall enhancement.
  - Configuration is fully environment-driven, no credentials hardcoded: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (required), `CLOUDINARY_UPLOAD_FOLDER`, `CLOUDINARY_ENHANCEMENT_TRANSFORMATION`, `CLOUDINARY_DELETE_AFTER_DOWNLOAD` (optional, with defaults).
  - `PassthroughEnhancementProvider` was not removed — it remains registered as `"passthrough"` and works as before, as an explicit offline/no-credentials fallback (`AUTOMATION1_ENHANCEMENT_PROVIDER=passthrough`).
  - `pipeline.js`'s `processFile` now passes `mediaId` to `provider.enhance(...)` (used by the Cloudinary provider to build a stable `public_id`); this is the only change to the pipeline itself — validation, the processing queue, file management, logging, and state handling are unchanged.
  - Error handling verified to match the spec: if `enhance()` throws (missing credentials, failed upload, network error), the original file in `Instagram Candidates/` is never touched, no partial file is left in `Enhanced/` (atomic write), the error is logged and recorded in state as `failed`, and the queue continues processing the remaining files independently.
- Updated `test/automation1.test.js`: existing tests that depended on the old default now explicitly pass `provider: "passthrough"` (pipeline behavior is identical regardless of provider, demonstrating the abstraction holds); the default-provider assertion was updated to `"cloudinary"`. Added tests mocking `globalThis.fetch` to verify (a) missing-credentials error handling end-to-end through the pipeline (2 files, both fail independently, originals untouched, queue still completes), (b) a full mocked upload → eager-transform → download → atomic-write round trip, including verifying `state.json` records the enhancement profile name, and (c) that a failed cleanup-deletion does not fail the overall enhancement. No real network calls or credentials are required to run the test suite.
- `npm test`: 27/27 passing (15 in `automation1.test.js` — 11 prior + 4 new Cloudinary-specific — plus 9 in `automation2.test.js` and 3 in `content-factory.test.js`).
- Manually verified against the real production Media Workspace (`~/Miles and Meals PH`, which now contains real creator photos from genuine prior usage): ran `automation1:run` with no Cloudinary credentials configured — confirmed it correctly skipped the 6 already-enhanced real photos (never re-processed or overwrote them) and only the one synthetic test file failed with a clear "Missing required environment variable" message; confirmed with `--provider passthrough` that the fallback still works; cleaned up the synthetic file and its `state.json`/log entries afterward without touching any real photo or its existing state.

### Enhancement Profile Refinement (this session)

- Refined `src/automation1/providers/enhancement-profile.js` to v1.1, retuning the Cloudinary transformation chain for visual consistency and a more premium, crisp, vibrant look while staying within the authenticity rules:
  - `e_viesus_correct` (unchanged) - AI-driven scene-adaptive exposure/white-balance/dynamic-range correction; the single component responsible for satisfying the brief's scene-specific guidance (sunny/cloudy/indoor/snow/night/water/architecture/forest) without any scene-classifier code.
  - `e_auto_contrast:25` -> `e_auto_contrast:20` and `e_auto_color:25` -> `e_auto_color:20` - slightly gentler caps, chosen so contrast/color normalization reads as "corrected" rather than "graded," reducing HDR risk.
  - `e_vibrance:20` -> `e_vibrance:22` - a touch more vibrancy for a "vibrant, inviting" feel, still using Cloudinary's skin-tone-protecting vibrance algorithm rather than flat saturation.
  - `e_sharpen:40` -> `e_unsharp_mask:60` - switched to edge-aware unsharp masking for a crisper, more professional detail rendition with lower halo risk than naive sharpening.
- Documented, in source comments and in `docs/FEATURES/automation-1.md`, why the "auto" components (viesus_correct, auto_contrast, auto_color) are what produce **brand consistency**: they normalize each photo toward the same target tonal range (rather than applying the same fixed offset to every photo, which would amplify pre-existing variance between photos) — this is the mechanism that makes a feed of sunny-beach, dim-restaurant, and snowy-peak photos read as one consistent editing style.
- Added a scene-coverage table (in both the source comments and `docs/FEATURES/automation-1.md`) explicitly mapping each of the brief's named scene categories (Sunny Outdoor, Cloudy/Overcast, Indoor, Snow, Night, Water, Architecture, Forest) to which transformation component(s) address it and why — including being explicit about Cloudinary's gaps (no literal "dehaze" or "highlight/shadow recovery" sliders; `e_viesus_correct` is the relied-upon proxy for both).
- No change to the provider abstraction, the pipeline, or which provider is default/registered — only the transformation values and version number inside the existing Cloudinary provider changed.
- Added a test asserting the transformation chain contains only known non-generative effect prefixes (`e_viesus_correct`, `e_auto_contrast`, `e_auto_color`, `e_vibrance`, `e_unsharp_mask`/`e_sharpen`) and explicitly rejects generative-effect prefixes, so a future edit to the profile that accidentally introduces a generative effect will fail CI.
- `npm test`: 28/28 passing.

### Automation 2 (no changes this session)

- See prior session history below and `docs/FEATURES/automation-2.md`. Still template-based with no image analysis; unaffected by this change.

## Work In Progress

- No active implementation work is currently in progress.

## Known Issues / Remaining Limitations

- The Cloudinary provider has not been exercised against a real Cloudinary account with real credentials in this session (no credentials were available in this environment) — it has been verified via mocked HTTP calls and against the missing-credentials error path on real production data. The user should run a small real test batch (a few photos) after configuring credentials, before trusting it for a full trip's worth of photos.
- The enhancement profile is a single, scene-adaptive transformation (relying on Cloudinary's Viesus engine to adapt per-image automatically); there is no scene-detection step in Automation 1, so the spec's per-scene guidance (outdoor sunny, indoor, snow, night, etc.) is satisfied adaptively rather than via separate hardcoded branches per scene. Adding true scene detection was out of scope (would expand the workflow) and is not implemented.
- A photo is briefly uploaded to Cloudinary's servers during enhancement (and deleted immediately afterward by default). This is an inherent tradeoff of using any cloud-based enhancement API; documented in `docs/FEATURES/automation-1.md` under Cloudinary Setup.
- Cloudinary cost estimates in the documentation are approximate and may be out of date; current pricing should be checked at cloudinary.com/pricing before high-volume use.
- Automation 2: captions, hashtags, and ALT text are template-based and filename-derived only — there is no real image/vision analysis. This is intentional (the requirements explicitly forbid inferring or inventing anything not actually known), not a defect.
- Neither automation has log rotation; fine for normal trip-length usage, would need revisiting under sustained continuous operation.
- No hosted database, queue, dashboard, or deployment target has been selected yet.
- The older `src/content-factory/` scaffold (scene intelligence, preset recommendation, draft generation) still exists alongside both automations and has not been retired; it operates on the separate local `content-factory/` development workspace, not the production Media Workspace.

## Priorities

1. Configure real Cloudinary credentials and run a small real test batch to visually confirm the Natural Travel Enhancement Profile's output quality before relying on it for a full trip.
2. If real image/vision analysis is ever added to Automation 2 (e.g. for ALT text or scene-aware captions), it must continue to follow the same authenticity rules: never invent a location, experience, or fact, and always leave room for human verification.
3. Decide whether/how to retire or merge the older `content-factory/` scaffold now that both automations operate directly against the production Media Workspace.

## Next Steps

- Both automations are feature-complete. Automation 1's enhancement step is now real (Cloudinary), pending the user's own visual validation with real credentials and real photos.
- Continue using `.project-memory/` as the handover source for every future session.
- Before implementing new automation, confirm any new feature fits within Automation 1 (stops at Lightroom Ready) or Automation 2 (stops at the posting package, never publishes) as defined in `docs/ARCHITECTURE.md`.
- When integrating an additional future enhancement provider, implement it as a new `BaseEnhancementProvider` subclass and register it via `registerProvider`; do not modify `src/automation1/pipeline.js` to special-case a provider.
