# Feature: Automation 2

## Purpose

Automation 2 prepares Instagram posting assets after the creator has finished editing. It does **not** publish content, does **not** connect to Instagram, and does **not** automate creative decisions. The creator remains responsible for captions, storytelling, location facts, and final approval.

## Workflow

```text
Instagram Ready/
-> Automation 2
-> Generate Posting Package
-> Creator Review
-> Manual Instagram Post
```

Automation stops at the Posting Package. Nothing in Automation 2 publishes or connects to any external service.

## Input

Only `Instagram Ready/` is watched/processed. Only new image files (per the same supported-extension list used by Automation 1) are picked up.

## Output

A new folder, `Posting Package/`, alongside the existing Media Workspace folders. For each processed image, Automation 2 writes one Markdown file named after the image (e.g. `sunset-beach.jpg` -> `Posting Package/sunset-beach.md`) containing:

- Image filename and path
- Suggested caption (draft only, with a `Location: __________` placeholder)
- Suggested hashtags
- ALT text (draft only)
- Posting checklist
- Processing log

## Commands

```bash
npm run automation2:init
npm run automation2:run
npm run automation2:status
npm run automation2:watch
```

All commands accept `--root <path>` to target an alternate Media Workspace.

## Configuration

Environment-driven (see `.env.example`):

- `AUTOMATION2_MEDIA_ROOT` - Media Workspace root. Defaults to `~/Miles and Meals PH`.
- `AUTOMATION2_QUEUE_CONCURRENCY` - files processed concurrently. Defaults to `2`.
- `AUTOMATION2_STABILITY_CHECK_MS` - delay used to confirm a candidate file has finished writing/syncing. Defaults to `300`.

## Content Rules

These rules are enforced by `src/automation2/posting-package.js` and are not configurable per run:

- **Caption** is a draft only. It never assumes a location (a `Location: __________` placeholder is always used instead), never invents an experience, and never states a historical or factual claim. It explicitly asks the creator to add the real story before posting.
- **Hashtags** are a small, reusable, non-spammy set of generic travel/brand hashtags — not inferred from image content (Automation 2 does not analyze pixels).
- **ALT text** is explicitly labeled as a filename-based draft, not a description of the image's actual visual content, and tells the creator to replace it with a precise description of what is visible before publishing.
- **Posting checklist** always includes: Caption reviewed, Location verified, Hashtags reviewed, ALT text reviewed, Image quality checked, Ready to publish.
- Every posting package ends with an explicit statement that it is a draft, that Automation 2 does not publish or connect to Instagram, and that the original image was not modified.

## Modules

- `src/automation2/config.js` - configuration resolution (root, concurrency, stability-check timing); reuses `SUPPORTED_IMAGE_EXTENSIONS` from `src/automation1/config.js`.
- `src/automation2/file-manager.js` - folder creation, listing `Instagram Ready/` files, and locating/checking for an existing posting package.
- `src/automation2/validator.js` - extension, emptiness, and write-stability checks (same approach as Automation 1).
- `src/automation2/queue.js` - bounded-concurrency processing queue.
- `src/automation2/posting-package.js` - builds the posting package data and renders/writes the Markdown file atomically.
- `src/automation2/logger.js` - structured JSON-line logging to `.automation2/logs/events.ndjson` inside the Media Workspace.
- `src/automation2/state-store.js` - per-image JSON state persisted to `.automation2/state.json` inside the Media Workspace.
- `src/automation2/watcher.js` - debounced, error-recovering `fs.watch` on `Instagram Ready/` for continuous mode.
- `src/automation2/pipeline.js` - orchestration for `init`, one-shot `run`, `status`, and continuous `watch`.

## Rules Enforced by Design

- Never publishes automatically — there is no publish step anywhere in the code.
- Never connects to Instagram — no network calls exist in this module.
- Never modifies the image — Automation 2 only reads image files to validate them; it never writes to `Instagram Ready/` or any image file.
- Never overwrites an existing posting package — `postingPackageExists()` is checked before generating, and a pre-existing `.md` file for an image is left untouched (counted as `skipped`).
- Preserves the existing folder structure — `ensureDirectories()` only creates `Instagram Ready/` (if missing) and the new `Posting Package/` folder; it does not alter or remove anything else in the Media Workspace.

## Reliability

Automation 2 was built hardened from the start, following the same standard established for Automation 1:

- The watcher catches `fs.watch` errors, retries with a bounded delay, and prints a clear message and restart instructions if it cannot recover, without crashing the process.
- Runs triggered by the watcher catch their own errors and log them instead of producing an unhandled promise rejection.
- State writes are atomic (temp file + rename); a corrupted state file is backed up and replaced with empty state instead of crashing.
- Posting package writes are atomic (temp file + rename, with cleanup on failure) so a crash mid-write can never leave a partial file under the final filename.
- `SIGINT`/`SIGTERM` are handled once each in the CLI; the watcher is closed and any in-flight run is awaited before exit.

## Tests

`test/automation2.test.js` covers workspace initialization, full posting package generation (content checks for caption, location placeholder, hashtags, ALT text, checklist, processing log, and the draft/no-publish disclaimer), never overwriting an existing package, rejecting unsupported files, idempotent re-runs, atomic/corrupted state handling, posting-package write failure cleanup, and the watcher surviving a failing run without crashing.
