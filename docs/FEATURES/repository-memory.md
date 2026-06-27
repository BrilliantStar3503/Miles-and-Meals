# Feature: Repository Memory

## Purpose

Repository Memory gives every AI coding agent a durable project handover system inside the repository.

Agents should not rely on previous chat history. The repository is the source of truth.

## Files

- `.project-memory/PROJECT_STATE.md` - current project status.
- `.project-memory/SESSION_HANDOVER.md` - latest development handover.
- `.project-memory/DECISIONS.md` - architectural and technical decisions.
- `.project-memory/CHANGELOG.md` - chronological project changes.
- `.project-memory/BACKLOG.md` - deferred improvements and future work.
- `.project-memory/AI_GUIDE.md` - required workflow for AI agents.

## Behavior

Every development session must:

- Read repository memory before coding.
- Update memory after coding.
- Keep docs concise and accurate.
- Commit changes.
- Push when a remote is configured and available.
