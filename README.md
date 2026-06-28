# Miles & Meals

Miles & Meals is a travel brand and AI-assisted content production ecosystem.

## Core Principle

AI automates repetitive work. The creator retains all creative decisions.

## Human Responsibilities

- Photography
- Videography
- Lightroom editing
- CapCut editing
- Storytelling
- Brand voice
- Publishing approval

## AI Responsibilities

- Watch folders
- Validate media
- Natural AI enhancement
- Organize files
- Scene detection
- Metadata generation
- Caption drafts
- Hashtags
- ALT text
- Logging

## Storage

- **Development Repository** (`Miles-and-Meals`, this repository) - code, documentation, automation, and project memory.
- **Media Workspace** (`Miles and Meals PH`) - photos, videos, Lightroom assets, CapCut projects, and published media. Not part of this repository.

## AI Content Factory

Initialize the local factory folders:

```bash
npm run factory:init
```

Run the local pipeline:

```bash
npm run factory:run
```

Check current pipeline status:

```bash
npm run factory:status
```

Run tests:

```bash
npm test
```

## Automation 1

Automation 1 validates and enhances selected Instagram candidate photos from the production Media Workspace, then stops for manual Lightroom editing. It uses a temporary Pass-through enhancement provider until a real AI provider is selected.

```bash
npm run automation1:init
npm run automation1:run
npm run automation1:status
npm run automation1:watch
```

See `docs/FEATURES/automation-1.md` for configuration (`.env.example`) and the provider abstraction, and `docs/ARCHITECTURE.md` for the full automation roadmap and authenticity/approval boundaries.

## Automation 2

Automation 2 watches `Instagram Ready/` and generates a draft posting package (caption, hashtags, ALT text, checklist) per image in `Posting Package/`. It never publishes, never connects to Instagram, and never modifies the image.

```bash
npm run automation2:init
npm run automation2:run
npm run automation2:status
npm run automation2:watch
```

See `docs/FEATURES/automation-2.md` for the content rules and `docs/OPERATOR_GUIDE.md` for day-to-day usage.

## Repository Memory

Every development session must begin by reading:

- `.project-memory/PROJECT_STATE.md`
- `.project-memory/SESSION_HANDOVER.md`
- `.project-memory/DECISIONS.md`

The repository is the source of truth. Do not rely on prior chat history.
