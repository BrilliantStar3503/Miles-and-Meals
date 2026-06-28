# Backlog

## Product Direction

- Decide whether the next milestone is a dashboard, API service, or deeper local automation workflow.
- Decide whether/how the older `content-factory/` development workspace and CLI should be retired or merged now that Automation 1 operates against the production Media Workspace directly.

## Miles & Meals Ecosystem

- Create brand guidelines.
- Create Lightroom preset spec sheets.
- Create CapCut editing style guide.
- Create destination metadata schema.
- Create post status tracker.
- Create n8n automation plan.
- Create website content structure.
- Prototype an approval dashboard for manual review (Automation 2).
- Prototype analytics tracking.

## AI Content Factory

### Automation 1 (Instagram Candidates -> Lightroom Ready)

Implemented: folder watcher, validation, processing queue, Pass-through enhancement provider behind a provider abstraction, file manager, logging, error handling, and configuration, operating against the production Media Workspace. See `docs/FEATURES/automation-1.md`.

Remaining:

- Integrate a real AI enhancement provider (OpenAI, Topaz, Adobe Firefly, or another) as a new `BaseEnhancementProvider` subclass.
- Add EXIF and GPS extraction.
- Add perceptual duplicate detection.
- Add configurable trip/project grouping.
- Add vision-model scene intelligence.
- Run `automation1:watch` continuously against real production media to validate long-running behavior.

### Automation 2 (Lightroom/Instagram Ready -> Posting Package)

- Port caption draft, hashtag, ALT text, and posting-package generation to operate against the production Media Workspace (currently only implemented in the `content-factory/` development scaffold).
- Add file watcher mode for `Instagram Ready/` / `Lightroom Ready/`.
- Add approval status transitions for manual review.
- Add analytics import and history.
- Add cloud storage sync.

### Out of Scope for Automation

- Automated Lightroom editing.
- Automated CapCut editing.
- Automated storytelling or brand voice generation that bypasses creator review.
- Automated publishing API adapters. Publishing is, and must remain, manual.
