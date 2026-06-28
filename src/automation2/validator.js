import fs from "node:fs/promises";
import path from "node:path";
import { SUPPORTED_IMAGE_EXTENSIONS } from "./config.js";

async function isFileStable(filePath, initialSize, waitMs) {
  if (!waitMs) {
    return true;
  }

  await new Promise((resolve) => setTimeout(resolve, waitMs));
  const stats = await fs.stat(filePath);
  return stats.size === initialSize;
}

export async function validateMediaFile(filePath, config) {
  const errors = [];
  const extension = path.extname(filePath).toLowerCase();

  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    errors.push(`Unsupported file extension: ${extension || "(none)"}`);
  }

  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    errors.push(`File is not readable: ${error.message}`);
    return { valid: false, errors };
  }

  if (!stats.isFile()) {
    errors.push("Not a regular file.");
    return { valid: false, errors };
  }

  if (stats.size === 0) {
    errors.push("File is empty.");
  }

  if (errors.length === 0) {
    try {
      if (!(await isFileStable(filePath, stats.size, config.stabilityCheckMs))) {
        errors.push("File size changed during stability check; it may still be writing or syncing.");
      }
    } catch (error) {
      errors.push(`File became unreadable during the stability check: ${error.message}`);
    }
  }

  return { valid: errors.length === 0, errors, sizeBytes: stats.size };
}
