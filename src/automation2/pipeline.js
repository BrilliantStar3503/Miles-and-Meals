import crypto from "node:crypto";
import path from "node:path";
import { createConfig } from "./config.js";
import { ensureDirectories, listReadyFiles, packagePathFor, postingPackageExists } from "./file-manager.js";
import { createLogger } from "./logger.js";
import { buildPostingPackage, writePostingPackage } from "./posting-package.js";
import { ProcessingQueue } from "./queue.js";
import { readState, writeState } from "./state-store.js";
import { validateMediaFile } from "./validator.js";
import { watchReadyFolder } from "./watcher.js";

function mediaIdFor(root, filePath) {
  const relativePath = path.relative(root, filePath);
  return crypto.createHash("sha1").update(relativePath).digest("hex").slice(0, 16);
}

export async function initializeAutomation2(options = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const state = await readState(config);
  await writeState(config, state);

  return { root: config.root, directories: config.directories };
}

async function processFile({ filePath, config, state, logger, summary }) {
  const id = mediaIdFor(config.root, filePath);
  const filename = path.basename(filePath);
  const relativePath = path.relative(config.root, filePath);

  const validation = await validateMediaFile(filePath, config);
  if (!validation.valid) {
    summary.invalid += 1;
    state.packages[id] = {
      ...state.packages[id],
      id,
      filename,
      relativePath,
      sourceStage: "Instagram Ready",
      status: "invalid",
      errors: validation.errors,
      updatedAt: new Date().toISOString()
    };
    await logger.warn("Image validation failed", { mediaId: id, filename, errors: validation.errors });
    return;
  }

  if (await postingPackageExists(config, filename)) {
    summary.skipped += 1;
    return;
  }

  const packagePath = packagePathFor(config, filename);

  try {
    const pkg = buildPostingPackage({ filename, relativePath });
    await writePostingPackage(packagePath, pkg);

    state.packages[id] = {
      id,
      filename,
      relativePath,
      packagePath: path.relative(config.root, packagePath),
      sourceStage: "Instagram Ready",
      status: "generated",
      generatedAt: pkg.generatedAt,
      updatedAt: new Date().toISOString()
    };
    summary.processed += 1;
    await logger.info("Posting package generated", { mediaId: id, filename });
  } catch (error) {
    summary.failed += 1;
    state.packages[id] = {
      ...state.packages[id],
      id,
      filename,
      relativePath,
      sourceStage: "Instagram Ready",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      updatedAt: new Date().toISOString()
    };
    await logger.error("Posting package generation failed", {
      mediaId: id,
      filename,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function runAutomation2(options = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const logger = createLogger(config);
  const state = await readState(config);
  const files = await listReadyFiles(config);
  const queue = new ProcessingQueue({ concurrency: config.concurrency });
  const summary = { processed: 0, skipped: 0, failed: 0, invalid: 0 };

  for (const filePath of files) {
    queue.add(() => processFile({ filePath, config, state, logger, summary }));
  }

  await queue.run();
  await writeState(config, state);

  return {
    root: config.root,
    candidateCount: files.length,
    ...summary
  };
}

export async function getAutomation2Status(options = {}) {
  const config = createConfig(options);
  const state = await readState(config);
  const packageEntries = Object.values(state.packages);

  return {
    root: config.root,
    packageCount: packageEntries.length,
    generatedCount: packageEntries.filter((entry) => entry.status === "generated").length,
    invalidCount: packageEntries.filter((entry) => entry.status === "invalid").length,
    failedCount: packageEntries.filter((entry) => entry.status === "failed").length
  };
}

export async function watchAutomation2(options = {}, { onRun } = {}) {
  const config = createConfig(options);
  await ensureDirectories(config);

  const logger = createLogger(config);
  await logger.info("Watching Instagram Ready for new media", {
    directory: config.directories["Instagram Ready"]
  });

  let inFlight = Promise.resolve();

  const run = () => {
    inFlight = (async () => {
      try {
        const result = await runAutomation2(options);
        if (onRun) {
          onRun(result);
        }
      } catch (error) {
        await logger.error("Automation 2 run failed", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    })();

    return inFlight;
  };

  await run();

  const watcherHandle = watchReadyFolder(config, run, { logger });

  return {
    async close() {
      watcherHandle.close();
      await inFlight;
    }
  };
}
