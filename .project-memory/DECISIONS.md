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
