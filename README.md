# Miles & Meals

Miles & Meals is a travel brand and AI-assisted content production operating system.

The repository currently contains:

- A permanent repository memory system for AI handoffs.
- The Miles & Meals Starter Kit deliverable.
- The first executable AI Content Factory CLI scaffold.

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

## Repository Memory

Every development session must begin by reading:

- `.project-memory/PROJECT_STATE.md`
- `.project-memory/SESSION_HANDOVER.md`
- `.project-memory/DECISIONS.md`

The repository is the source of truth. Do not rely on prior chat history.
