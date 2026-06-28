# Automation Operator Guide

This is the day-to-day guide for using Automation 1 and Automation 2 while traveling. It assumes the Media Workspace at `~/Miles and Meals PH` already has the required folders (see "Folder Structure" below).

This guide covers Automation 1 and Automation 2 only. Lightroom editing, CapCut editing, storytelling, brand voice, location facts, and publishing remain manual — see `docs/ARCHITECTURE.md`.

## Folder Structure

Inside `~/Miles and Meals PH`:

- `Trips/` - raw imports from camera/phone, organized however you like (e.g. by date or destination). Not watched by either automation.
- `Instagram Candidates/` - **the only folder Automation 1 watches.** Copy your selected, Instagram-worthy photos here.
- `Enhanced/` - where Automation 1 writes its output. Do not put files here manually.
- `Lightroom Ready/` - where you put a photo after finishing manual Lightroom edits. Neither automation writes here.
- `Instagram Ready/` - **the only folder Automation 2 watches.** Copy your finished, Lightroom-edited photos here once you're ready to prep them for posting.
- `Posting Package/` - where Automation 2 writes a draft posting package (Markdown) per image. Do not put files here manually.
- `.automation1/`, `.automation2/` - internal state and logs for each automation. Don't edit these by hand.

## Automation 1: RAW to Lightroom Ready

### 1. Import Photos

Copy or import your photos from camera/phone into `Trips/` (organize by date or destination as you prefer). This step is manual — Automation 1 does not touch `Trips/`.

### 2. Choose Instagram-Worthy Photos

Review your `Trips/` import and decide which photos are worth posting. This is a creative decision and stays entirely with you — Automation 1 does not select photos for you.

### 3. Copy Selected Photos

Copy (not move, if you want to keep the original in `Trips/`) your chosen photos into:

```text
~/Miles and Meals PH/Instagram Candidates/
```

Only put photos here once you're happy with the selection — anything dropped in this folder will be picked up automatically.

### 4. Start Automation 1

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

### 5. Verify Processing

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

### 6. Where Enhanced Photos Appear

Successfully processed photos appear, unmodified, in:

```text
~/Miles and Meals PH/Enhanced/
```

By default, the enhancement step applies the official Miles & Meals Natural Travel Enhancement Profile via Cloudinary — a natural, Lightroom-style auto-correction (exposure, white balance, dynamic range, mild clarity and vibrance), not generative AI editing. It never invents scenery, changes the weather, or adds/removes anything from the photo. This requires Cloudinary credentials to be configured (see `docs/FEATURES/automation-1.md`). If credentials aren't set up yet, set `AUTOMATION1_ENHANCEMENT_PROVIDER=passthrough` to copy files unmodified instead.

From there, edit manually in Lightroom and save the finished result into `Lightroom Ready/`. Automation 1 stops at that point.

### 7. Stop the Watcher

If running `automation1:watch` in a terminal, press `Ctrl+C`. It closes the folder watcher cleanly and exits.

If it's running in the background, find and stop the process:

```bash
pkill -f "automation1:watch"
```

## Automation 2: Instagram Ready to Posting Package

### 1. Finish Your Edit

Once a photo is fully edited (Lightroom, and CapCut for video) and you're ready to prepare it for posting, copy it into:

```text
~/Miles and Meals PH/Instagram Ready/
```

This is a manual, creative decision — Automation 2 does not decide what's ready to post.

### 2. Start Automation 2

```bash
npm run automation2:run
```

or, to keep watching for new files:

```bash
npm run automation2:watch
```

Both default to `~/Miles and Meals PH`. Add `-- --root "/path/to/workspace"` to target a different folder.

### 3. Verify Processing

Check the command's JSON output, e.g.:

```json
{
  "processed": 1,
  "skipped": 0,
  "failed": 0,
  "invalid": 0
}
```

Or check status at any time:

```bash
npm run automation2:status
```

Detailed history is in `~/Miles and Meals PH/.automation2/logs/events.ndjson`.

### 4. Review the Posting Package

For each image, Automation 2 writes one Markdown file in `Posting Package/` with the same base name (e.g. `sunset-beach.jpg` -> `Posting Package/sunset-beach.md`), containing:

- A **draft caption** with a `Location: __________` placeholder — fill in the real location and the real story. The draft never invents a location, an experience, or a historical fact.
- **Suggested hashtags** — a small, reusable set; edit freely.
- **Draft ALT text** — based only on the filename, not the actual image. Replace it with a precise description of what's actually visible in the photo.
- A **posting checklist** (caption reviewed, location verified, hashtags reviewed, ALT text reviewed, image quality checked, ready to publish).
- A **processing log** entry recording when the package was generated.

**Automation 2 never publishes, never connects to Instagram, and never modifies the image.** Posting to Instagram is always a manual, separate step you do yourself after completing the checklist.

### 5. Stop the Watcher

Same as Automation 1: `Ctrl+C` in the terminal, or `pkill -f "automation2:watch"` if running in the background.

## Troubleshooting

- **A photo shows as `invalid`**: check `errors` in the status/log output. Usually an unsupported file type, a zero-byte file, or a file that was still copying/syncing when checked — wait a moment and re-copy it.
- **Nothing happens after copying a photo**: confirm the relevant `watch` command is actually running, or run the one-shot `run` command manually once.
- **Need to re-process a photo with Automation 1**: it skips files that already exist in `Enhanced/`. Delete the file from `Enhanced/` first if you need to redo it.
- **Every photo shows as `failed` with a "Missing required environment variable" message**: Cloudinary credentials aren't configured. Follow the Cloudinary Setup steps in `docs/FEATURES/automation-1.md`, or set `AUTOMATION1_ENHANCEMENT_PROVIDER=passthrough` to use the offline fallback in the meantime. The original photo in `Instagram Candidates/` is never affected by an enhancement failure.
- **Need to regenerate a posting package**: Automation 2 never overwrites an existing posting package. Delete the `.md` file from `Posting Package/` first if you want a fresh one.
- **The watcher printed a "watcher lost connection" message**: this happens if the folder briefly became unavailable (e.g. an external drive blip). It retries automatically a few times. If you see a `FATAL` message saying the watcher stopped permanently, just restart it with `npm run automation1:watch` or `npm run automation2:watch`.
- **You stopped a watcher with Ctrl+C while it was processing a file**: it waits for that file to finish before exiting, so you shouldn't see a half-written file in `Enhanced/` or `Posting Package/`.
