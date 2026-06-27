import fs from "node:fs/promises";
import path from "node:path";
import { STATE_VERSION } from "./config.js";

export function createEmptyState() {
  return {
    version: STATE_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    media: {},
    drafts: {},
    events: []
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

export async function appendEvent(config, state, event) {
  const enriched = {
    id: `${Date.now()}-${state.events.length + 1}`,
    createdAt: new Date().toISOString(),
    ...event
  };

  state.events.push(enriched);
  await fs.mkdir(path.dirname(config.eventsPath), { recursive: true });
  await fs.appendFile(config.eventsPath, `${JSON.stringify(enriched)}\n`, "utf8");
}
