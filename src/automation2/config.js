import os from "node:os";
import path from "node:path";
import { SUPPORTED_IMAGE_EXTENSIONS } from "../automation1/config.js";

export { SUPPORTED_IMAGE_EXTENSIONS };

export const AUTOMATION2_DIRECTORIES = ["Instagram Ready", "Posting Package"];

function expandHome(targetPath) {
  if (targetPath && targetPath.startsWith("~")) {
    return path.join(os.homedir(), targetPath.slice(1));
  }

  return targetPath;
}

export function createConfig(options = {}) {
  const root = path.resolve(
    expandHome(options.root ?? process.env.AUTOMATION2_MEDIA_ROOT ?? "~/Miles and Meals PH")
  );
  const concurrency = Number(options.concurrency ?? process.env.AUTOMATION2_QUEUE_CONCURRENCY ?? 2) || 1;
  const stabilityCheckMs = Number(
    options.stabilityCheckMs ?? process.env.AUTOMATION2_STABILITY_CHECK_MS ?? 300
  );
  const automationDir = path.join(root, ".automation2");

  return {
    root,
    concurrency,
    stabilityCheckMs: Number.isFinite(stabilityCheckMs) ? stabilityCheckMs : 300,
    automationDir,
    statePath: path.join(automationDir, "state.json"),
    logsPath: path.join(automationDir, "logs", "events.ndjson"),
    directories: Object.fromEntries(
      AUTOMATION2_DIRECTORIES.map((directory) => [directory, path.join(root, directory)])
    )
  };
}
