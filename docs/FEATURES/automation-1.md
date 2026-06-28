# Feature: Automation 1

## Purpose

Automation 1 is the production-ready implementation of the first automation stage defined in `docs/ARCHITECTURE.md`: it takes selected Instagram-worthy candidate photos, validates them, and runs them through an enhancement provider into `Enhanced/`, then stops so a human can finish the work in Lightroom.

It operates against the production Media Workspace (`~/Miles and Meals PH` by default), not the repository's `content-factory/` development workspace.

## Workflow

```text
Instagram Candidates/
-> Validation
-> Processing Queue
-> Enhancement Provider (Pass-through)
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
- `AUTOMATION1_ENHANCEMENT_PROVIDER` - enhancement provider name. Defaults to `passthrough`.
- `AUTOMATION1_QUEUE_CONCURRENCY` - number of files processed concurrently. Defaults to `2`.
- `AUTOMATION1_STABILITY_CHECK_MS` - delay used to confirm a candidate file has finished writing/syncing before validation passes. Defaults to `300`.

## Modules

- `src/automation1/config.js` - configuration resolution.
- `src/automation1/file-manager.js` - folder creation and candidate file listing.
- `src/automation1/validator.js` - extension, emptiness, and write-stability checks.
- `src/automation1/queue.js` - bounded-concurrency processing queue.
- `src/automation1/providers/base-provider.js` - abstract `BaseEnhancementProvider`.
- `src/automation1/providers/passthrough-provider.js` - default `PassthroughEnhancementProvider`.
- `src/automation1/providers/index.js` - provider registry (`createProvider`, `registerProvider`).
- `src/automation1/logger.js` - structured JSON-line logging.
- `src/automation1/state-store.js` - per-media JSON state.
- `src/automation1/watcher.js` - debounced folder watcher for continuous mode.
- `src/automation1/pipeline.js` - orchestration for `init`, `run`, `status`, and `watch`.

## Provider Abstraction

Every enhancement provider extends `BaseEnhancementProvider` and implements `async enhance({ sourcePath, destinationPath })`. The pipeline always calls providers through this interface, so swapping providers never requires changing `pipeline.js`, the queue, the validator, the file manager, or the logger.

The default and currently only registered provider is `PassthroughEnhancementProvider`. It copies the candidate file into `Enhanced/` unmodified and records `{ provider: "passthrough", status: "complete" }` in state. This preserves the authenticity boundary until a real provider is selected.

To add a future provider (OpenAI, Topaz, Adobe Firefly, or another service):

1. Create a new class extending `BaseEnhancementProvider` in `src/automation1/providers/`.
2. Implement `enhance({ sourcePath, destinationPath })` to call the provider's API and write the enhanced result to `destinationPath`.
3. Register it with `registerProvider("<name>", () => new YourProvider())`.
4. Set `AUTOMATION1_ENHANCEMENT_PROVIDER=<name>` (or `--provider <name>`).

No other Automation 1 code changes.

## State and Logs

Automation 1 never stores production media, state, or logs inside this repository. Runtime state is written to `<Media Workspace>/.automation1/state.json` and events are appended to `<Media Workspace>/.automation1/logs/events.ndjson`, both inside the Media Workspace.

## Approval and Authenticity Boundary

- The pass-through provider does not alter pixels, invent scenery, or fabricate edits.
- Automation 1 never writes to `Lightroom Ready/`; that folder is populated only by manual Lightroom editing.
- Automation 1 has no publishing capability.

## Production Hardening

Beyond the core workflow, Automation 1 includes the following reliability measures:

- **Watcher error recovery** (`watcher.js`) - `fs.watch` errors are caught, logged, and retried with a fixed delay up to a retry limit. If retries are exhausted, the watcher stops and prints a clear console message explaining what happened and how to restart it (`npm run automation1:watch`). The process is never crashed by a watcher error.
- **No unhandled rejections from triggered runs** - each run triggered by the watcher is wrapped so a failure is logged via the logger instead of becoming an unhandled promise rejection (which would otherwise crash the process).
- **Atomic state writes** (`state-store.js`) - state is written to a temp file and renamed into place, so a crash or power loss mid-write cannot corrupt `state.json`.
- **Corrupted state recovery** (`state-store.js`) - if `state.json` cannot be parsed, it is moved aside to a `.corrupt-<timestamp>` backup and Automation 1 continues with empty state instead of crashing.
- **Atomic enhanced file writes** (`providers/passthrough-provider.js`) - the provider copies to a temp file and renames it into place, with cleanup of the temp file on failure. A crash mid-copy can never leave a partial file under the final filename, which is what duplicate-detection (`destinationExists`) checks against.
- **Stability-check failures don't escape silently** (`validator.js`) - if a candidate file disappears or becomes unreadable during the write-stability check, it is now recorded as invalid (with a log entry and a state entry), instead of throwing an uncaught error that would silently skip the file.
- **Graceful shutdown** (`cli.js`) - `SIGINT` and `SIGTERM` are handled once each; the watcher is closed and any in-flight run is awaited before the process exits, so a photo currently being copied is not left in a half-enhanced state by Ctrl+C.

## Tests

`test/automation1.test.js` covers workspace initialization, successful pass-through enhancement, rejection of unsupported files, idempotent re-runs, registering a stub future provider, atomic/corrupted state handling, pass-through provider cleanup on copy failure, watcher error recovery, and `watchAutomation1` surviving a failing run without crashing.
