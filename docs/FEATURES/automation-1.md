# Feature: Automation 1

## Purpose

Automation 1 is the production-ready implementation of the first automation stage defined in `docs/ARCHITECTURE.md`: it takes selected Instagram-worthy candidate photos, validates them, and runs them through an enhancement provider into `Enhanced/`, then stops so a human can finish the work in Lightroom.

It operates against the production Media Workspace (`~/Miles and Meals PH` by default), not the repository's `content-factory/` development workspace.

## Workflow

```text
Instagram Candidates/
-> Validation
-> Processing Queue
-> Enhancement Provider (Miles & Meals Natural Travel Enhancement Profile)
-> Enhanced/
-> Manual Lightroom Editing
-> Lightroom Ready/
```

Automation stops at `Lightroom Ready/`. Lightroom editing, CapCut editing, storytelling, brand voice, and publishing approval remain human responsibilities and are out of scope for this automation.

Only `Instagram Candidates/` is watched/processed — not every RAW image.

## Commands

```bash
npm run automation1:init
npm run automation1:run
npm run automation1:status
npm run automation1:watch
```

All commands accept `--root <path>` to target an alternate Media Workspace, and `automation1:run`/`automation1:watch` accept `--provider <name>`.

## Configuration

Configuration is environment-driven (see `.env.example`):

- `AUTOMATION1_MEDIA_ROOT` - Media Workspace root. Defaults to `~/Miles and Meals PH`.
- `AUTOMATION1_ENHANCEMENT_PROVIDER` - enhancement provider name. Defaults to `cloudinary` (the official Miles & Meals Natural Travel Enhancement Profile). Set to `passthrough` to copy files unmodified instead — useful if Cloudinary credentials are not configured yet, or for offline testing.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - required when using the `cloudinary` provider. See "Cloudinary Setup" below.
- `CLOUDINARY_UPLOAD_FOLDER` - Cloudinary folder used while a photo is briefly hosted for enhancement. Defaults to `miles-and-meals/automation1`.
- `CLOUDINARY_ENHANCEMENT_TRANSFORMATION` - override the enhancement profile's Cloudinary transformation string. Leave unset to use the official profile.
- `CLOUDINARY_DELETE_AFTER_DOWNLOAD` - set to `false` to keep the uploaded copy on Cloudinary after enhancement (debugging only). Defaults to `true`: the photo is deleted from Cloudinary immediately after download, so creator media is not retained on a third-party service.
- `AUTOMATION1_QUEUE_CONCURRENCY` - number of files processed concurrently. Defaults to `2`.
- `AUTOMATION1_STABILITY_CHECK_MS` - delay used to confirm a candidate file has finished writing/syncing before validation passes. Defaults to `300`.

## Modules

- `src/automation1/config.js` - configuration resolution.
- `src/automation1/file-manager.js` - folder creation and candidate file listing.
- `src/automation1/validator.js` - extension, emptiness, and write-stability checks.
- `src/automation1/queue.js` - bounded-concurrency processing queue.
- `src/automation1/providers/base-provider.js` - abstract `BaseEnhancementProvider`.
- `src/automation1/providers/passthrough-provider.js` - `PassthroughEnhancementProvider`, an offline/fallback provider that copies the file unmodified.
- `src/automation1/providers/cloudinary-provider.js` - `CloudinaryEnhancementProvider`, the default real AI enhancement provider implementing the Miles & Meals Natural Travel Enhancement Profile.
- `src/automation1/providers/enhancement-profile.js` - the official enhancement profile definition (the Cloudinary transformation chain and its rationale).
- `src/automation1/providers/index.js` - provider registry (`createProvider`, `registerProvider`).
- `src/automation1/logger.js` - structured JSON-line logging.
- `src/automation1/state-store.js` - per-media JSON state.
- `src/automation1/watcher.js` - debounced folder watcher for continuous mode.
- `src/automation1/pipeline.js` - orchestration for `init`, `run`, `status`, and `watch`.

## Provider Abstraction

Every enhancement provider extends `BaseEnhancementProvider` and implements `async enhance({ sourcePath, destinationPath, mediaId })`. The pipeline always calls providers through this interface, so swapping providers never requires changing `pipeline.js`, the queue, the validator, the file manager, or the logger.

The default provider is `CloudinaryEnhancementProvider` (registered as `"cloudinary"`), which applies the Miles & Meals Natural Travel Enhancement Profile via Cloudinary's automatic image-correction engine. `PassthroughEnhancementProvider` (registered as `"passthrough"`) remains available as an offline fallback — it copies the candidate file into `Enhanced/` unmodified and records `{ provider: "passthrough", status: "complete" }` in state.

To add a future provider (OpenAI, Topaz, Adobe Firefly, or another service):

1. Create a new class extending `BaseEnhancementProvider` in `src/automation1/providers/`.
2. Implement `enhance({ sourcePath, destinationPath, mediaId })` to call the provider's API and write the enhanced result to `destinationPath`.
3. Register it with `registerProvider("<name>", () => new YourProvider())`.
4. Set `AUTOMATION1_ENHANCEMENT_PROVIDER=<name>` (or `--provider <name>`).

No other Automation 1 code changes.

## The Miles & Meals Natural Travel Enhancement Profile

This is the official Miles & Meals editing standard (currently v1.2), defined in `src/automation1/providers/enhancement-profile.js` and applied by `CloudinaryEnhancementProvider`. The goal is not dramatic AI editing — it's to make every photo look like it was professionally edited in Lightroom by an experienced travel photographer: vibrant, crisp, and inviting, while remaining completely authentic and visually consistent from one photo to the next.

**Real-world verified (v1.2):** v1.0/v1.1 used `e_viesus_correct`, a Cloudinary effect that turned out to require a separate paid add-on subscription not active on the account it was tested against — every real run silently fell back to the unmodified original while reporting success (a bug, since fixed; see "Bugs Found and Fixed During Real Verification" below). v1.2 replaces it with `e_improve`, a built-in Cloudinary effect requiring no add-on, and has been run against 6 real travel photos (cathedral interiors, a river/bridge landscape, a sunlit street scene with people, and a portrait) with visually confirmed results: richer-but-realistic sky and greenery, crisper architectural and stonework detail, unchanged composition and people, and natural, unfiltered skin tones — with no HDR look, no oversaturation, and no hallucinated content.

**The transformation chain, in Lightroom-workflow order:**

1. `e_improve` - Cloudinary's built-in (no add-on required) automatic exposure/contrast/color correction. Used with no mode qualifier deliberately: testing against a real account showed identical output whether called plain, `:indoor`, or `:outdoor` on the same photo, so a mode qualifier would only add false specificity — using the plain form keeps this codebase free of any scene-classification logic. It's the closest available equivalent to Lightroom's highlight/shadow recovery and dehaze sliders — Cloudinary has no separate parameters for those.
2. `e_auto_contrast:20` - normalizes contrast toward a consistent target based on each photo's own histogram. Recovers contrast in flat/overcast shots without pushing already-contrasty shots into an HDR look.
3. `e_auto_color:20` - normalizes color balance toward neutral based on each photo's own color cast (indoor warmth, snow's blue cast, etc.), capped low enough to correct the cast without stripping the natural ambient mood entirely.
4. `e_vibrance:22` - boosts muted colors (foliage, water, sky) while Cloudinary's vibrance algorithm protects already-saturated tones, most importantly skin tones. This is the single component responsible for "richer blue sky if one exists" and "natural greenery" — it amplifies existing color and cannot invent a color that wasn't there. Confirmed visually: a real river/bridge photo's already-blue sky and green hillside came out richer, while the river's natural brown-green water tone was left untouched.
5. `e_unsharp_mask:60` - edge-aware sharpening for crisp detail (architecture, foliage, snow, water texture) without halo artifacts, capped at a moderate value to read as "crisp," not "obviously sharpened." Confirmed visually: a real cathedral-interior photo's stonework and stained glass read crisper with no visible halo around the arches or windows.

**Why this produces brand consistency, not just an authentic look:** the "auto" components (`e_improve`, `auto_contrast`, `auto_color`) each normalize a photo *toward the same target tonal range*, rather than applying the same fixed offset to every photo. A fixed offset would amplify whatever variance already existed between, say, a flat overcast shot and a contrasty sunny shot — pushing them further apart. Normalizing toward a shared target is what makes a scrolling Instagram feed read as one consistent editing style across sunny beaches, dim restaurants, and snowy peaks. The fixed-amount components (`vibrance`, `unsharp_mask`) are deliberately mild so they read as a light, repeatable finish on top of that normalization, not as the dominant editing decision.

**Global rules, enforced by construction, not just by prompt instruction:** every component is a deterministic, per-pixel correction. None is generative or diffusion-based. This means the profile structurally cannot crop, replace the sky, change the weather, add or remove people or buildings, invent scenery, hallucinate details, or change the location — there is no code path that could do any of that, because none of the effects used are capable of adding image content that wasn't already there.

**Scene coverage without scene-detection code:** Automation 1 has no scene-classification step (adding one was out of scope — see Known Issues in `.project-memory/PROJECT_STATE.md`). Coverage of the brief's scene-specific guidance instead comes from the adaptive components above:

| Scene | How it's covered |
|---|---|
| Sunny Outdoor | `e_improve` (highlight recovery) + `vibrance` (richer sky/greenery only if already present) |
| Cloudy / Overcast | `auto_contrast` (recovers cloud/local contrast) + `vibrance` (mild lift, can't invent color that isn't there, so the cloudy mood is preserved) |
| Indoor | `auto_color` (neutralizes cast without stripping warmth) + `e_improve` (shadow recovery, noise reduction) + vibrance's built-in skin-tone protection |
| Snow | `auto_color` (removes blue cast) + `e_improve` (prevents highlight clipping) + `unsharp_mask` (snow texture) |
| Night | `e_improve` (noise reduction, realistic lighting) + `unsharp_mask` (careful sharpness); no brightness-boosting component, so night stays night |
| Water | `vibrance` (natural blues/turquoise only if present) + `e_improve` (highlight recovery in reflections) |
| Architecture | `unsharp_mask` (edge definition, stone/window texture) + `auto_contrast` (local contrast), with `auto_color` capped low to keep building materials realistic |
| Forest | `vibrance` capped at 22 specifically to avoid a neon-green look, + `unsharp_mask` (leaf detail) |

See the source comments in `src/automation1/providers/enhancement-profile.js` for the full rationale behind every value.

**What it deliberately avoids:** HDR-style stacking, oversaturation, color clipping, halos, and artificial/over sharpening. Every numeric cap above was chosen so no single component dominates — removing any one still leaves a believable, natural photo, which is the signal that the profile reads as polish, not a heavy edit. This was confirmed against real output, not just assumed: none of the 6 real verification photos showed clipped colors, halos, or an HDR look.

### Bugs Found and Fixed During Real Verification

Running Automation 1 against a real Cloudinary account (the first time it had been exercised with real credentials) surfaced two correctness bugs in `cloudinary-provider.js` that mocked tests had not caught, because the mocks didn't reproduce Cloudinary's exact request/response contract:

1. **Missing `eager` parameter in the upload signature.** Cloudinary requires every parameter sent in a signed request to be included in the signature calculation. The `eager` transformation string was sent as a form field but omitted from the signed parameter set, so every real upload was rejected with `401 Invalid Signature`. Fixed by including `eager` in the signature.
2. **Silent fallback to the unmodified original on a failed enhancement, reported as success.** If the requested `eager` transformation failed (as it did when `e_viesus_correct` hit the missing add-on), the code fell back to `result.secure_url` — the plain, unmodified upload — and returned it as a successful "enhancement." Every "enhanced" photo was byte-for-byte identical to its original, with no error logged. Fixed by checking the eager result explicitly and throwing a clear error if it's missing or `status: "failed"`, so a real enhancement failure is now correctly recorded as `failed` in state (original preserved, queue continues) instead of silently masquerading as success.
3. **Cleanup deletion using the wrong public ID.** When both `folder` and `public_id` are supplied on upload, Cloudinary stores the asset under `folder/public_id`. The cleanup step was calling `destroy` with the bare `public_id` only, which doesn't match any real asset — Cloudinary returned `200 {"result":"not found"}` (a non-error HTTP status), so the code logged no warning while the temporary cloud copy was never actually deleted. Fixed by destroying the full `folder/public_id` path and by checking the JSON `result` field (not just the HTTP status) so a future mismatch like this surfaces as a warning instead of failing silently.

All three are now covered by regression tests in `test/automation1.test.js` using a mocked `fetch` that reproduces the exact failure conditions found.

## Cloudinary Setup

1. Create a free Cloudinary account at <https://cloudinary.com>.
2. From the account dashboard, copy the **Cloud name**, **API Key**, and **API Secret**.
3. Copy `.env.example` to `.env` in the repository root and fill in:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. `.env` is git-ignored — never commit real credentials. Automation 1 reads these from the process environment at runtime; nothing is hardcoded.
5. Run `npm run automation1:run` (or `automation1:watch`) as usual.

**How a photo is processed:** the candidate image is uploaded to your Cloudinary account, the Miles & Meals Natural Travel Enhancement Profile transformation is applied, the result is downloaded into `Enhanced/`, and (by default) the uploaded copy is deleted from Cloudinary immediately afterward (`CLOUDINARY_DELETE_AFTER_DOWNLOAD=true`). This means a photo is briefly hosted on Cloudinary's servers during processing — be aware of this if processing sensitive images.

**Estimated cost:** Cloudinary's free tier includes a monthly credit allowance (historically around 25 credits/month, covering roughly 25,000 standard transformations, or a blended allowance of transformations/storage/bandwidth) which is enough for casual travel-content volumes. Beyond the free tier, Cloudinary bills pay-as-you-go per additional credit, or via paid plans starting around $89–99/month for higher volume. **Cloudinary's pricing changes over time — verify current numbers at <https://cloudinary.com/pricing> before relying on this estimate**, especially if processing large trip volumes (hundreds of photos) regularly.

**Offline / no-credentials fallback:** set `AUTOMATION1_ENHANCEMENT_PROVIDER=passthrough` (or `--provider passthrough`) to skip Cloudinary entirely and copy files unmodified, e.g. while testing or before credentials are configured.

## State and Logs

Automation 1 never stores production media, state, or logs inside this repository. Runtime state is written to `<Media Workspace>/.automation1/state.json` and events are appended to `<Media Workspace>/.automation1/logs/events.ndjson`, both inside the Media Workspace.

## Approval and Authenticity Boundary

- The Cloudinary provider applies only deterministic tonal/color corrections (see "The Miles & Meals Natural Travel Enhancement Profile" above); it never invents scenery, never alters composition, and never fabricates content. The passthrough provider does not alter pixels at all.
- Automation 1 never writes to `Lightroom Ready/`; that folder is populated only by manual Lightroom editing.
- Automation 1 has no publishing capability.

## Production Hardening

Beyond the core workflow, Automation 1 includes the following reliability measures:

- **Watcher error recovery** (`watcher.js`) - `fs.watch` errors are caught, logged, and retried with a fixed delay up to a retry limit. If retries are exhausted, the watcher stops and prints a clear console message explaining what happened and how to restart it (`npm run automation1:watch`). The process is never crashed by a watcher error.
- **No unhandled rejections from triggered runs** - each run triggered by the watcher is wrapped so a failure is logged via the logger instead of becoming an unhandled promise rejection (which would otherwise crash the process).
- **Atomic state writes** (`state-store.js`) - state is written to a temp file and renamed into place, so a crash or power loss mid-write cannot corrupt `state.json`.
- **Corrupted state recovery** (`state-store.js`) - if `state.json` cannot be parsed, it is moved aside to a `.corrupt-<timestamp>` backup and Automation 1 continues with empty state instead of crashing.
- **Atomic enhanced file writes** (both providers) - each provider copies/downloads to a temp file and renames it into place, with cleanup of the temp file on failure. A crash mid-write can never leave a partial file under the final filename, which is what duplicate-detection (`destinationExists`) checks against.
- **Enhancement failures preserve the original and keep the queue moving** (`pipeline.js`) - if `enhance()` throws (e.g. missing Cloudinary credentials, a failed upload, or a network error), the candidate file in `Instagram Candidates/` is never touched, no partial file is left in `Enhanced/`, the error is logged and recorded in state as `failed`, and the processing queue continues with the remaining files.
- **Non-fatal cleanup failures** (`cloudinary-provider.js`) - if deleting the temporary Cloudinary copy fails after a successful enhancement, that failure is logged as a warning only; the enhancement itself is still considered successful.
- **Stability-check failures don't escape silently** (`validator.js`) - if a candidate file disappears or becomes unreadable during the write-stability check, it is recorded as invalid (with a log entry and a state entry), instead of throwing an uncaught error that would silently skip the file.
- **Graceful shutdown** (`cli.js`) - `SIGINT` and `SIGTERM` are handled once each; the watcher is closed and any in-flight run is awaited before the process exits, so a photo currently being processed is not left in a half-enhanced state by Ctrl+C.

## Tests

`test/automation1.test.js` covers workspace initialization, pass-through enhancement, rejection of unsupported files, idempotent re-runs, registering a stub future provider, atomic/corrupted state handling, provider cleanup on write failure, watcher error recovery, `watchAutomation1` surviving a failing run, and the Cloudinary provider specifically: missing-credentials error handling (original preserved, other files keep processing), a full mocked upload/download/cleanup round trip, and non-fatal cleanup-failure handling. Cloudinary's HTTP API is mocked via `globalThis.fetch` in tests — no real network calls or credentials are required to run the test suite.
