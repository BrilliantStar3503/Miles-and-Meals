# Decisions

## 2026-06-27 - Repository Memory Is the Source of Truth

Decision: Maintain project memory inside `.project-memory/` and high-level documentation inside `docs/`.

Reasoning: Future AI agents should be able to continue development without relying on chat history or a specific tool.

## 2026-06-27 - Keep Generated Deliverables in `outputs/`

Decision: Store user-facing generated artifacts in `outputs/`.

Reasoning: This keeps deliverables separate from source documentation and temporary working files.

## 2026-06-27 - No Application Stack Selected Yet

Decision: Do not choose a runtime, framework, or database until there is a concrete implementation target.

Reasoning: The project currently consists of documentation, workflow design, and content production templates. Choosing a stack prematurely would add unnecessary process.

## 2026-06-27 - Use Node.js for the First Local Pipeline

Decision: Build the first AI Content Factory implementation as a dependency-light Node.js CLI using built-in modules.

Reasoning: The project needs a runnable local automation spine before choosing cloud infrastructure, queues, or a dashboard framework. Node.js is available in the workspace and supports cross-platform file workflows, CLI commands, JSON state, and future API integrations.

## 2026-06-27 - Start With a Local Passthrough Enhancement Adapter

Decision: The first enhancement adapter copies RAW files to `Enhanced/` and records the action as `local-passthrough`.

Reasoning: This preserves authenticity and avoids pretending AI enhancement is implemented before a provider is selected. It creates a replaceable adapter boundary for future enhancement services.

## 2026-06-27 - Keep Creator Media and Runtime State Out of Git

Decision: Ignore local media, generated drafts, event logs, and runtime state while tracking `.gitkeep` placeholders for the factory folder structure.

Reasoning: The GitHub repository is public and should not accidentally commit raw creator media, generated content drafts, or local operational data.

## 2026-06-28 - AI Automates Repetitive Work; the Creator Retains All Creative Decisions

Decision: Adopt this as the permanent Core Principle for all future automation in this repository.

Reasoning: Establishes a clear, durable boundary between what AI is allowed to automate and what must remain a human responsibility, so future features cannot drift into automating creative or publishing decisions.

## 2026-06-28 - Automation Is Split Into Two Bounded Stages

Decision: Automation 1 covers RAW -> AI Enhancement -> Enhanced -> Manual Lightroom Editing -> Lightroom Ready, and stops there. Automation 2 covers Lightroom/Instagram Ready -> Caption Draft -> Hashtags -> ALT Text -> Posting Package -> Manual Review -> Manual Publish, and nothing publishes automatically.

Reasoning: Gives every future feature a clear stage boundary to implement against, and makes the "stop here" points explicit so manual editing and manual publishing are never accidentally automated.

## 2026-06-28 - Implement Automation 1 With a Pass-Through Provider Behind a Provider Abstraction

Decision: Build the complete Automation 1 framework (watcher, validator, processing queue, file manager, logger, state, configuration) now, but use a temporary `PassthroughEnhancementProvider` for the enhancement step instead of integrating a paid AI provider. All providers implement a shared `BaseEnhancementProvider` interface and are obtained through a registry (`createProvider`/`registerProvider`).

Reasoning: Lets the full production workflow be built, tested, and run today without committing to or paying for a specific AI enhancement vendor. A future provider (OpenAI, Topaz, Adobe Firefly, etc.) can be added by registering a new subclass, with zero changes to the pipeline, queue, validator, file manager, or logger.

## 2026-06-28 - Automation 1 Operates Against the Production Media Workspace, Not `content-factory/`

Decision: `src/automation1/` reads from and writes to the production Media Workspace (`~/Miles and Meals PH` by default, configurable via `AUTOMATION1_MEDIA_ROOT` or `--root`), including its own runtime state (`.automation1/state.json`) and logs (`.automation1/logs/events.ndjson`) stored inside the Media Workspace. The older `src/content-factory/` scaffold continues to operate on the repository-local `content-factory/` development workspace and was left unchanged.

Reasoning: Keeps production creator media, and any state/logs derived from it, entirely out of the git repository, while still providing a separate local development/test path (`content-factory/`) for the original MVP commands.

## 2026-06-28 - Automation 1 Watches Only `Instagram Candidates/`

Decision: Automation 1 validates and enhances only files placed in `Instagram Candidates/`, not the full `RAW/` folder.

Reasoning: RAW-to-candidate selection is a creative decision (per the Core Principle) that the creator must make manually; automating it would cross the Human/AI responsibility boundary documented in `docs/ARCHITECTURE.md`.

## 2026-06-28 - Separate the Development Repository From the Media Workspace

Decision: This repository (`Miles-and-Meals`) holds code, documentation, automation, and project memory. The production Media Workspace (`Miles and Meals PH`) holds actual photos, videos, Lightroom assets, CapCut projects, and published media, and lives outside this repository.

Reasoning: Keeps real creator media out of the public development repository while giving automation code a clear, named external target to eventually integrate with.
