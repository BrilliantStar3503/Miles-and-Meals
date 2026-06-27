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
