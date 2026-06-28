import fs from "node:fs/promises";
import path from "node:path";

export function createEmptyState() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    media: {}
  };
}

export async function readState(config) {
  try {
    const raw = await fs.readFile(config.statePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return createEmptyState();
    }

    throw error;
  }
}

export async function writeState(config, state) {
  state.updatedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(config.statePath), { recursive: true });
  await fs.writeFile(config.statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
