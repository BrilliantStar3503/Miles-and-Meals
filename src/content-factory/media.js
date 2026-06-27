import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { SUPPORTED_MEDIA_EXTENSIONS } from "./config.js";

export function isSupportedMedia(filePath) {
  return SUPPORTED_MEDIA_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export async function listMediaFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMediaFiles(fullPath)));
    } else if (entry.isFile() && isSupportedMedia(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

export async function inspectMedia(filePath, root) {
  const stats = await fs.stat(filePath);
  const relativePath = path.relative(root, filePath);
  const id = crypto.createHash("sha1").update(relativePath).digest("hex").slice(0, 16);

  return {
    id,
    filename: path.basename(filePath),
    extension: path.extname(filePath).toLowerCase(),
    relativePath,
    sizeBytes: stats.size,
    modifiedAt: stats.mtime.toISOString()
  };
}

export async function copyIfMissing(source, destination) {
  try {
    await fs.access(destination);
    return false;
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
  return true;
}
