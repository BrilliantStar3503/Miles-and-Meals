# Feature: AI Content Factory

## Purpose

The AI Content Factory automates the repetitive parts of content production so the creator can focus on creative decisions. It does not replace human judgment, editing, storytelling, brand voice, or publishing.

See `docs/ARCHITECTURE.md` for the full Core Principle, Human/AI responsibility split, and Automation Roadmap.

## Current MVP

The current implementation provides a dependency-light Node.js CLI covering the development-time stand-in for Automation 1 (up to Lightroom Ready) and the early stages of Automation 2 (draft generation, not posting or publishing).

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

This mirrors Automation 1 and the early part of Automation 2 from `docs/ARCHITECTURE.md`. Manual Lightroom editing, CapCut editing, manual review, and manual publish are out of scope for this CLI by design.

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

It copies RAW files into `Enhanced/` and records the action in state. It does not alter pixels, invent scenery, modify faces, or fabricate edits. A future "natural AI enhancement" adapter must preserve the same authenticity boundary, and must stop short of the manual Lightroom editing stage.

## Approval Boundary

Generated drafts are always marked `pending_approval`.

Publishing is not implemented. Nothing can publish automatically, in the current MVP or in the target architecture. Manual review and manual publish are permanent human responsibilities.

## Next Integrations

- EXIF and GPS extraction.
- Perceptual duplicate detection.
- Natural AI enhancement adapter (stopping before Lightroom editing).
- Vision-model scene analysis.
- Hashtag and ALT text generation for the posting package.
- Approval dashboard for manual review.
- Logging improvements across watch-folder events.
