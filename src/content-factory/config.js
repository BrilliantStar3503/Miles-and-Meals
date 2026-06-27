import path from "node:path";

export const STATE_VERSION = 1;

export const SUPPORTED_MEDIA_EXTENSIONS = new Set([
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
  ".raf",
  ".mp4",
  ".mov",
  ".m4v"
]);

export const FACTORY_DIRECTORIES = [
  "RAW",
  "Enhanced",
  "Lightroom Ready",
  "CapCut Ready",
  "Instagram Ready",
  "Published",
  "Archive",
  "Templates",
  "Music",
  "Presets",
  "Brand",
  "Automation",
  "Analytics",
  "Logs",
  "Drafts",
  "Backups"
];

export function createConfig(options = {}) {
  const root = path.resolve(options.root ?? "content-factory");

  return {
    root,
    statePath: path.join(root, "content-factory-state.json"),
    eventsPath: path.join(root, "Logs", "events.ndjson"),
    directories: Object.fromEntries(
      FACTORY_DIRECTORIES.map((directory) => [directory, path.join(root, directory)])
    )
  };
}
