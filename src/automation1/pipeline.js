import crypto from "node:crypto";
import path from "node:path";
import { createConfig } from "./config.js";
import { destinationExists, ensureDirectories, listCandidateFiles } from "./file-manager.js";
import { createLogger } from "./logger.js";
import { createProvider } from "./providers/index.js";
import { ProcessingQueue } from "./queue.js";
import { readState, writeState } from "./state-store.js";
import { validateMediaFile } from "./validator.js";
import { watchCandidates } from "./watcher.js";

function mediaIdFor(root, filePath) {
  const relativePath = path.relative(root, filePath);
  return crypto.createHash("sha1").update(relativePath).digest("hex").slice(0, 16);
}

export async function initializeAutomation1(options = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const state = await readState(config);
  await writeState(config, state);

  return { root: config.root, provider: config.provider, directories: config.directories };
}

async function processFile({ filePath, config, state, provider, logger, summary }) {
  const id = mediaIdFor(config.root, filePath);
  const filename = path.basename(filePath);
  const relativePath = path.relative(config.root, filePath);
  const destinationPath = path.join(config.directories.Enhanced, filename);

  const validation = await validateMediaFile(filePath, config);
  if (!validation.valid) {
    summary.invalid += 1;
    state.media[id] = {
      ...state.media[id],
      id,
      filename,
      relativePath,
      sourceStage: "Instagram Candidates",
      status: "invalid",
      errors: validation.errors,
      updatedAt: new Date().toISOString()
    };
    await logger.warn("Media validation failed", { mediaId: id, filename, errors: validation.errors });
    return;
  }

  if (await destinationExists(destinationPath)) {
    summary.skipped += 1;
    return;
  }

  try {
    const result = await provider.enhance({ sourcePath: filePath, destinationPath });
    state.media[id] = {
      id,
      filename,
      relativePath,
      enhancedPath: path.relative(config.root, destinationPath),
      sourceStage: "Instagram Candidates",
      currentStage: "Enhanced",
      status: "enhanced",
      enhancement: result,
      updatedAt: new Date().toISOString()
    };
    summary.processed += 1;
    await logger.info("Media enhanced", { mediaId: id, filename, provider: result.provider });
  } catch (error) {
    summary.failed += 1;
    state.media[id] = {
      ...state.media[id],
      id,
      filename,
      relativePath,
      sourceStage: "Instagram Candidates",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      updatedAt: new Date().toISOString()
    };
    await logger.error("Enhancement failed", {
      mediaId: id,
      filename,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function runAutomation1(options = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const logger = createLogger(config);
  const state = await readState(config);
  const provider = createProvider(config.provider);
  const files = await listCandidateFiles(config);
  const queue = new ProcessingQueue({ concurrency: config.concurrency });
  const summary = { processed: 0, skipped: 0, failed: 0, invalid: 0 };

  for (const filePath of files) {
    queue.add(() => processFile({ filePath, config, state, provider, logger, summary }));
  }

  await queue.run();
  await writeState(config, state);

  return {
    root: config.root,
    provider: config.provider,
    candidateCount: files.length,
    ...summary
  };
}

export async function getAutomation1Status(options = {}) {
  const config = createConfig(options);
  const state = await readState(config);
  const mediaEntries = Object.values(state.media);

  return {
    root: config.root,
    provider: config.provider,
    mediaCount: mediaEntries.length,
    enhancedCount: mediaEntries.filter((entry) => entry.status === "enhanced").length,
    invalidCount: mediaEntries.filter((entry) => entry.status === "invalid").length,
    failedCount: mediaEntries.filter((entry) => entry.status === "failed").length
  };
}

export async function watchAutomation1(options = {}, { onRun } = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const logger = createLogger(config);
  await logger.info("Watching Instagram Candidates for new media", {
    directory: config.directories["Instagram Candidates"]
  });

  let inFlight = Promise.resolve();

  const run = () => {
    inFlight = (async () => {
      try {
        const result = await runAutomation1(options);
        if (onRun) {
          onRun(result);
        }
      } catch (error) {
        await logger.error("Automation 1 run failed", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })();

    return inFlight;
  };

  await run();

  const watcherHandle = watchCandidates(config, run, { logger });

  return {
    async close() {
      watcherHandle.close();
      await inFlight;
    }
  };
}
