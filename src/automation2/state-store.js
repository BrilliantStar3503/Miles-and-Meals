import fs from "node:fs/promises";
import path from "node:path";

export function createEmptyState() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    packages: {}
  };
}

export async function readState(config) {
  let raw;

  try {
    raw = await fs.readFile(config.statePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return createEmptyState();
    }

    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const backupPath = `${config.statePath}.corrupt-${Date.now()}`;
    console.error(
      `[automation2] ERROR State file is corrupted and could not be parsed: ${config.statePath}\n` +
        `  Moving it to ${backupPath} and starting with empty state.`
    );
    await fs.rename(config.statePath, backupPath).catch(() => {});
    return createEmptyState();
  }
}

export async function writeState(config, state) {
  state.updatedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(config.statePath), { recursive: true });

  const tempPath = `${config.statePath}.tmp-${process.pid}`;
  await fs.writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, config.statePath);
}
