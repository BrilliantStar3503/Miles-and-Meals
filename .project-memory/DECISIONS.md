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

## 2026-06-28 - Validate Automation 1 Against Production Before Starting Automation 2

Decision: Before any Automation 2 work, validate Automation 1 against the real `~/Miles and Meals PH` workspace, using only synthetic test data, and document operator usage and any issues found rather than fixing them immediately.

Reasoning: Confirms the implementation works against the actual production path (not just temp directories in tests) before depending on it for real travel, while keeping this validation pass separate from new feature work.

## 2026-06-28 - Harden Automation 1 for Production Without Changing the Workflow

Decision: Before starting Automation 2 or integrating a real AI provider, perform a reliability-only pass on Automation 1: watcher error handling with bounded retry and a clear fatal message, atomic state writes with corrupted-state recovery, atomic enhanced-file writes with temp-file cleanup, validation-time error handling for disappearing files, and graceful `SIGINT`/`SIGTERM` shutdown that waits for in-flight work. No folder structure, workflow stage, or functionality was changed.

Reasoning: Several crash/corruption risks were found beyond the originally known watcher issue (unhandled rejections from triggered runs, non-atomic state and file writes, a silent validation gap, abrupt shutdown). Fixing these now, while the workflow is still simple and well understood, is cheaper than discovering them mid-trip. Automation 1 is now considered Production Ready and is intentionally frozen until real-world usage surfaces further issues.

## 2026-06-28 - Implement Automation 2 as Draft-Only, With No Image Analysis and No Network Access

Decision: Automation 2 watches `Instagram Ready/` and generates a Markdown posting package (caption, hashtags, ALT text, checklist, processing log) per image in a new `Posting Package/` folder. Captions never assume a location (a `Location: __________` placeholder is used instead) and never invent an experience or historical fact. ALT text is explicitly labeled as filename-derived only, since Automation 2 performs no image/vision analysis. There is no code path anywhere in `src/automation2/` that calls Instagram or any external service.

Reasoning: Automation 2's whole purpose is to remove repetitive drafting work without crossing into the creator's responsibilities (storytelling, brand voice, factual claims, publishing approval). Anything resembling a real description of image content or a real location would either be fabricated (since no vision model is integrated) or a creative claim that belongs to the human. Keeping every output an explicit, labeled draft preserves the same authenticity boundary established for Automation 1.

## 2026-06-28 - Build Automation 2 Hardened From the Start, Independent of Automation 1's Frozen Code

Decision: `src/automation2/` duplicates Automation 1's queue, logger, state-store, and watcher patterns (including the watcher error-handling/retry logic and atomic-write hardening) rather than importing or refactoring Automation 1's modules to share them. The one exception is reusing the read-only `SUPPORTED_IMAGE_EXTENSIONS` constant from `src/automation1/config.js`.

Reasoning: Automation 1 was just declared frozen and Production Ready. Refactoring its internals to extract shared utilities would risk regressing tested, hardened code for a modest reduction in duplication. Building Automation 2 to the same reliability standard independently keeps both automations consistent without touching what's already frozen.

## 2026-06-28 - Replace the Pass-Through Provider's Default Role With Cloudinary, a Non-Generative AI Correction Engine

Decision: Make `CloudinaryEnhancementProvider` (registered as `"cloudinary"`) the default Automation 1 enhancement provider, applying the official **Miles & Meals Natural Travel Enhancement Profile**. The profile uses only Cloudinary's deterministic, per-pixel automatic correction effects (`e_viesus_correct` plus capped contrast/color/vibrance/sharpening) — no generative or diffusion-based effects of any kind.

Reasoning: The enhancement rules explicitly forbid hallucination, scene invention, cropping, sky replacement, weather changes, and adding/removing people or buildings. A generative model (e.g. an image-diffusion edit API) cannot structurally guarantee any of that — it can only be prompted not to, which is not a guarantee. A deterministic, non-generative correction engine guarantees it by construction: it has no mechanism to add image content that wasn't already in the original photo. This was judged a stronger fit for the stated goal ("look professionally edited in Lightroom," not "look AI-edited") than a generative alternative.

## 2026-06-28 - Keep the Pass-Through Provider as an Explicit Fallback, Not Remove It

Decision: `PassthroughEnhancementProvider` remains registered as `"passthrough"` and fully functional; it is no longer the default, but it was not deleted.

Reasoning: It's a documented, zero-dependency escape hatch for offline development/testing and for real use before Cloudinary credentials are configured. Removing it would have forced every test and every credential-less run to fail instead of degrading gracefully, with no benefit — the provider abstraction is explicitly designed to support multiple registered providers at once.

## 2026-06-28 - Do Not Add Scene Detection to Satisfy the Per-Scene Enhancement Guidance

Decision: The Natural Travel Enhancement Profile is a single, uniform transformation chain applied to every photo, relying on Cloudinary's Viesus engine to adapt its correction per image automatically. No scene-detection step (outdoor/indoor/snow/night/etc.) was added to Automation 1.

Reasoning: The task instructions required preserving the existing Automation 1 workflow and verifying it "remains unchanged except for replacing the Pass-through provider." Adding scene detection would have expanded the workflow (a new analysis stage before enhancement) beyond a provider swap. The chosen correction engine is itself content-aware/adaptive per image, which satisfies the spirit of the per-scene guidance without adding a new pipeline stage; true per-scene branching is recorded as a possible future enhancement, not done here.

## 2026-06-28 - Refine the Enhancement Profile via Normalization, Not Per-Photo Branching, for Brand Consistency

Decision: Retune the Natural Travel Enhancement Profile (v1.0 -> v1.1) by adjusting the existing Cloudinary effect parameters (`auto_contrast`/`auto_color` capped lower, `vibrance` slightly higher, `sharpen` replaced with `unsharp_mask`), rather than adding scene-detection logic or per-photo conditional parameters to satisfy the brief's "scene-based optimization" and "brand consistency" requirements.

Reasoning: Cloudinary's "auto" effects already normalize each photo toward a shared target tonal range based on that photo's own histogram/color-cast — which is precisely the mechanism needed for consistency across varied raw input (a flat overcast shot and a contrasty sunny shot should converge toward the same finished look, not diverge further). Adding our own scene classifier would duplicate work the chosen engine already does adaptively, and would expand the Automation 1 workflow, which the user had previously asked to keep unchanged when the Cloudinary provider was introduced. The scene-by-scene guidance in the brief is satisfied by documenting which existing component covers which scene, not by writing new branching code.

## 2026-06-28 - Replace e_viesus_correct With e_improve After Real-World Testing Revealed an Add-On Dependency

Decision: Retune the Natural Travel Enhancement Profile to v1.2, replacing `e_viesus_correct` with `e_improve` (Cloudinary's built-in automatic correction effect, no add-on required), used with no mode qualifier.

Reasoning: Real verification against a live Cloudinary account showed `e_viesus_correct` requires a separate paid add-on subscription that wasn't active, causing every real eager transformation to fail server-side. This was masked by a separate bug (see below) that silently returned the unmodified original as if enhancement had succeeded. Once both issues were found, `e_improve` was chosen as the replacement because it's a core Cloudinary effect (no additional subscription), and direct testing confirmed plain `e_improve` produces identical output to `e_improve:indoor`/`e_improve:outdoor` on the same photo — so no mode qualifier, and therefore no scene-classification code, was needed to preserve adaptive behavior.

## 2026-06-28 - Fix Cloudinary Provider Bugs Found During Real Verification, Even Though Scoped Changes Were Limited to enhancement-profile.js

Decision: In addition to the profile retune, fix three bugs discovered inside `cloudinary-provider.js` itself during real-world testing: (1) the upload signature omitted the `eager` parameter, causing every real request to fail with `401 Invalid Signature`; (2) a failed eager transformation silently fell back to the unmodified original and reported success, masking failures entirely; (3) the cleanup-deletion step used the wrong public ID (missing the folder prefix), so temporary cloud copies were never actually deleted despite no error being logged.

Reasoning: The task instructions said adjustments after real-world review should be limited to transformation parameters in `enhancement-profile.js`, in the context of *visual/tuning* adjustments. These three issues are different in kind: they are correctness bugs that made the provider not function at all (signature failure), silently lie about success (masked failures), and leak data indefinitely on a third-party service (failed cleanup). Leaving them unfixed would have meant Automation 1 could not be frozen as "verified" in any honest sense -- the verification task itself would have been impossible to complete, and creator photos would have been silently left on Cloudinary indefinitely. Fixing them stayed entirely within `cloudinary-provider.js`; no change was made to the pipeline, the provider abstraction, the workflow, or the folder structure.

## 2026-06-29 - Auto-Load `.env` via `--env-file-if-exists`, Not the Literally-Requested `--env-file`

Decision: Add `node --env-file-if-exists=.env` to every `automation1:*`/`automation2:*` npm script, instead of the literally-requested `node --env-file=.env`.

Reasoning: Real-world testing showed `npm run automation1:watch`/`:run` never loaded `.env` at all, which is why a real Cloudinary setup silently went unused in the user's actual workflow (a long-running watcher kept using the old in-memory `passthrough` default, with zero Cloudinary env vars present). The fix needed to guarantee `.env` loads automatically whenever it exists. `--env-file` was rejected because Node makes it a hard error (exit code 9, "not found") when the file is absent -- that would break every script for anyone without Cloudinary configured yet (a fresh clone, CI, or someone intentionally using the `passthrough` fallback with no `.env` at all), which is a regression the original objective didn't ask for. `--env-file-if-exists` (also a native Node flag, no new dependency) loads the file when present and continues silently when it isn't, meeting the stated goal ("every local npm command automatically loads `.env`") without that regression.

## 2026-06-28 - Separate the Development Repository From the Media Workspace

Decision: This repository (`Miles-and-Meals`) holds code, documentation, automation, and project memory. The production Media Workspace (`Miles and Meals PH`) holds actual photos, videos, Lightroom assets, CapCut projects, and published media, and lives outside this repository.

Reasoning: Keeps real creator media out of the public development repository while giving automation code a clear, named external target to eventually integrate with.
