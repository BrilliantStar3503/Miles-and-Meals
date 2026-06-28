import fs from "node:fs/promises";
import path from "node:path";

const CONSOLE_METHOD_BY_LEVEL = {
  info: "log",
  warn: "warn",
  error: "error"
};

export function createLogger(config) {
  async function log(level, message, meta = {}) {
    const entry = { timestamp: new Date().toISOString(), level, message, ...meta };
    await fs.mkdir(path.dirname(config.logsPath), { recursive: true });
    await fs.appendFile(config.logsPath, `${JSON.stringify(entry)}\n`, "utf8");

    const consoleMethod = CONSOLE_METHOD_BY_LEVEL[level] ?? "log";
    console[consoleMethod](`[automation1] ${level.toUpperCase()} ${message}`);

    return entry;
  }

  return {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta)
  };
}
