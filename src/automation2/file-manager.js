import fs from "node:fs/promises";
import path from "node:path";
import { AUTOMATION2_DIRECTORIES } from "./config.js";

export async function ensureDirectories(config) {
  await fs.mkdir(config.automationDir, { recursive: true });
  await fs.mkdir(path.dirname(config.logsPath), { recursive: true });

  for (const directory of AUTOMATION2_DIRECTORIES) {
    await fs.mkdir(config.directories[directory], { recursive: true });
  }
}

export async function listReadyFiles(config) {
  const directory = config.directories["Instagram Ready"];
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

export function packagePathFor(config, imageFilename) {
  const baseName = imageFilename.replace(/\.[^.]+$/, "");
  return path.join(config.directories["Posting Package"], `${baseName}.md`);
}

export async function postingPackageExists(config, imageFilename) {
  try {
    await fs.access(packagePathFor(config, imageFilename));
    return true;
  } catch {
    return false;
  }
}
