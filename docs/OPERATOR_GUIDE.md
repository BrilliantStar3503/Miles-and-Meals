# Automation 1 Operator Guide

This is the day-to-day guide for using Automation 1 while traveling. It assumes the Media Workspace at `~/Miles and Meals PH` already has the required folders (see "Folder Structure" below).

This guide covers Automation 1 only. Lightroom editing, CapCut editing, storytelling, brand voice, and publishing remain manual — see `docs/ARCHITECTURE.md`.

## Folder Structure

Inside `~/Miles and Meals PH`:

- `Trips/` - raw imports from camera/phone, organized however you like (e.g. by date or destination). Not watched by Automation 1.
- `Instagram Candidates/` - **the only folder Automation 1 watches.** Copy your selected, Instagram-worthy photos here.
- `Enhanced/` - where Automation 1 writes its output. Do not put files here manually.
- `Lightroom Ready/` - where you put a photo after finishing manual Lightroom edits. Automation 1 never writes here.
- `Instagram Ready/` - for Automation 2 (not yet built). Not used by Automation 1.
- `.automation1/` - internal state and logs. Don't edit these by hand.

## 1. Import Photos

Copy or import your photos from camera/phone into `Trips/` (organize by date or destination as you prefer). This step is manual — Automation 1 does not touch `Trips/`.

## 2. Choose Instagram-Worthy Photos

Review your `Trips/` import and decide which photos are worth posting. This is a creative decision and stays entirely with you — Automation 1 does not select photos for you.

## 3. Copy Selected Photos

Copy (not move, if you want to keep the original in `Trips/`) your chosen photos into:

```text
~/Miles and Meals PH/Instagram Candidates/
```

Only put photos here once you're happy with the selection — anything dropped in this folder will be picked up automatically.

## 4. Start Automation 1

Two ways to run it, from the `Miles-and-Meals` repository folder:

**One-shot** (processes whatever is currently in `Instagram Candidates/`, then exits):

```bash
npm run automation1:run
```

**Continuous watch** (keeps running and processes new photos as you add them):

```bash
npm run automation1:watch
```

Both default to `~/Miles and Meals PH`. To point at a different folder, add `-- --root "/path/to/workspace"`.

## 5. Verify Processing

Check the command's JSON output, e.g.:

```json
{
  "processed": 2,
  "skipped": 0,
  "failed": 0,
  "invalid": 0
}
```

- `processed` - photos successfully enhanced.
- `invalid` - rejected (wrong file type, empty file, or still being written/synced — fix and re-copy).
- `failed` - enhancement threw an error (check the log).
- `skipped` - already processed in a previous run.

Or check status at any time:

```bash
npm run automation1:status
```

Detailed history is in `~/Miles and Meals PH/.automation1/logs/events.ndjson` (one JSON line per event).

## 6. Where Enhanced Photos Appear

Successfully processed photos appear, unmodified, in:

```text
~/Miles and Meals PH/Enhanced/
```

(Currently the enhancement step is a temporary Pass-through provider — it copies the file as-is. No real AI enhancement has been integrated yet.)

From there, edit manually in Lightroom and save the finished result into `Lightroom Ready/`. Automation stops at that point.

## 7. Stop the Watcher

If running `automation1:watch` in a terminal, press `Ctrl+C`. It closes the folder watcher cleanly and exits.

If it's running in the background, find and stop the process:

```bash
pkill -f "automation1:watch"
```

## Troubleshooting

- **A photo shows as `invalid`**: check `errors` in the status/log output. Usually an unsupported file type, a zero-byte file, or a file that was still copying/syncing when checked — wait a moment and re-copy it.
- **Nothing happens after copying a photo**: confirm `automation1:watch` is actually running, or run `automation1:run` manually once.
- **Need to re-process a photo**: Automation 1 skips files that already exist in `Enhanced/`. Delete the file from `Enhanced/` first if you need to redo it.
