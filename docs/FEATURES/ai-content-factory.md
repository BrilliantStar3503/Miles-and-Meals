# Feature: AI Content Factory

## Purpose

The AI Content Factory is the first executable foundation for the Miles & Meals content operating system.

It is designed as a modular local pipeline that can later swap in real AI enhancement, image recognition, publishing APIs, cloud storage, queues, retries, and dashboards.

## Current MVP

The current implementation provides a dependency-light Node.js CLI.

Commands:

```bash
npm run factory:init
npm run factory:run
npm run factory:status
```

Tests:

```bash
npm test
```

## Current Workflow

```text
RAW/
-> local passthrough enhancement record
-> Enhanced/
-> filename-based scene intelligence
-> Lightroom preset recommendation

Instagram Ready/
-> content draft generation
-> Drafts/
-> pending approval state
```

## Current Modules

- `src/cli.js` - command entry point.
- `src/content-factory/config.js` - folder and state configuration.
- `src/content-factory/pipeline.js` - orchestration for init, run, and status.
- `src/content-factory/media.js` - media file discovery and inspection.
- `src/content-factory/scene-intelligence.js` - MVP scene labels from filename/path keywords.
- `src/content-factory/preset-recommendation.js` - preset recommendation rules.
- `src/content-factory/content-drafts.js` - caption, hashtag, ALT text, SEO, and schedule draft generation.
- `src/content-factory/state-store.js` - local JSON state and event logging.

## Authenticity Boundary

The current enhancement adapter is intentionally `local-passthrough`.

It copies RAW files into `Enhanced/` and records the action in state. It does not alter pixels, invent scenery, modify faces, or fabricate edits. Real enhancement providers must preserve the same authenticity boundary.

## Approval Boundary

Generated drafts are always marked `pending_approval`.

Publishing is not implemented. Nothing can publish automatically in the current MVP.

## Next Integrations

- EXIF and GPS extraction.
- Perceptual duplicate detection.
- Real image enhancement adapter.
- Vision-model scene analysis.
- Approval dashboard.
- Publishing API adapters.
- Analytics storage.
