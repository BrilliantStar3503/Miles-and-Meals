import fs from "node:fs/promises";
import path from "node:path";
import { AUTOMATION1_DIRECTORIES } from "./config.js";

export async function ensureDirectories(config) {
  await fs.mkdir(config.automationDir, { recursive: true });
  await fs.mkdir(path.dirname(config.logsPath), { recursive: true });

  for (const directory of AUTOMATION1_DIRECTORIES) {
    await fs.mkdir(config.directories[directory], { recursive: true });
  }
}

export async function listCandidateFiles(config) {
  const directory = config.directories["Instagram Candidates"];
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

export async function destinationExists(destination) {
  try {
    await fs.access(destination);
    return true;
  } catch {
    return false;
  }
}
