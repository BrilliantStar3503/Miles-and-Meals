import os from "node:os";
import path from "node:path";

export const AUTOMATION1_DIRECTORIES = ["Instagram Candidates", "Enhanced", "Lightroom Ready"];

export const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".dng",
  ".cr2",
  ".cr3",
  ".nef",
  ".arw",
  ".raf"
]);

function expandHome(targetPath) {
  if (targetPath && targetPath.startsWith("~")) {
    return path.join(os.homedir(), targetPath.slice(1));
  }

  return targetPath;
}

export function createConfig(options = {}) {
  const root = path.resolve(
    expandHome(options.root ?? process.env.AUTOMATION1_MEDIA_ROOT ?? "~/Miles and Meals PH")
  );
  const provider = options.provider ?? process.env.AUTOMATION1_ENHANCEMENT_PROVIDER ?? "cloudinary";
  const concurrency = Number(options.concurrency ?? process.env.AUTOMATION1_QUEUE_CONCURRENCY ?? 2) || 1;
  const stabilityCheckMs = Number(
    options.stabilityCheckMs ?? process.env.AUTOMATION1_STABILITY_CHECK_MS ?? 300
  );
  const automationDir = path.join(root, ".automation1");

  return {
    root,
    provider,
    concurrency,
    stabilityCheckMs: Number.isFinite(stabilityCheckMs) ? stabilityCheckMs : 300,
    automationDir,
    statePath: path.join(automationDir, "state.json"),
    logsPath: path.join(automationDir, "logs", "events.ndjson"),
    directories: Object.fromEntries(
      AUTOMATION1_DIRECTORIES.map((directory) => [directory, path.join(root, directory)])
    )
  };
}
