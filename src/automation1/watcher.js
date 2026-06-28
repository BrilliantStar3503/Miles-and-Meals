import fs from "node:fs";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 1000;

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

export function watchCandidates(config, onChange, options = {}) {
  const {
    debounceMs = 300,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    logger
  } = options;
  const directory = config.directories["Instagram Candidates"];

  let debounceTimer = null;
  let retryTimer = null;
  let watcher = null;
  let retryCount = 0;
  let closed = false;

  const trigger = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      Promise.resolve(onChange()).catch((error) => {
        logger?.error?.("Automation 1 run triggered by the watcher failed", {
          error: describeError(error)
        });
      });
    }, debounceMs);
  };

  const reportFatal = (error) => {
    const message =
      `The folder watcher for "${directory}" has stopped after repeated errors and will not recover automatically.\n` +
      "New files copied into Instagram Candidates will NOT be processed until the watcher is restarted.\n" +
      "To restart it, run: npm run automation1:watch";

    logger?.error?.("Folder watcher stopped permanently", { directory, error: describeError(error) });
    console.error(`\n[automation1] FATAL ${message}\n`);
  };

  const start = () => {
    try {
      watcher = fs.watch(directory, { persistent: true }, trigger);
    } catch (error) {
      reportFatal(error);
      return;
    }

    watcher.on("error", handleWatcherError);
  };

  function handleWatcherError(error) {
    logger?.error?.("Folder watcher error", { directory, error: describeError(error) });

    try {
      watcher?.close();
    } catch {
      // The watcher is already in a failed state; nothing further to clean up.
    }

    if (closed) {
      return;
    }

    if (retryCount >= maxRetries) {
      reportFatal(error);
      return;
    }

    retryCount += 1;
    console.error(
      `[automation1] ERROR Watcher lost connection to "${directory}" ` +
        `(retry ${retryCount}/${maxRetries} in ${retryDelayMs}ms)...`
    );
    retryTimer = setTimeout(() => {
      if (!closed) {
        start();
      }
    }, retryDelayMs);
  }

  start();

  return {
    close() {
      closed = true;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (retryTimer) {
        clearTimeout(retryTimer);
      }

      try {
        watcher?.close();
      } catch {
        // Already closed or never started successfully.
      }
    }
  };
}
