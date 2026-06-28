import fs from "node:fs/promises";
import path from "node:path";
import { BaseEnhancementProvider } from "./base-provider.js";

export class PassthroughEnhancementProvider extends BaseEnhancementProvider {
  constructor() {
    super("passthrough");
  }

  async enhance({ sourcePath, destinationPath }) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });

    const tempPath = `${destinationPath}.tmp-${process.pid}-${Date.now()}`;
    try {
      await fs.copyFile(sourcePath, tempPath);
      await fs.rename(tempPath, destinationPath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      throw error;
    }

    return {
      provider: this.name,
      status: "complete",
      notes:
        "Pass-through provider copies the original file without modification until a real enhancement provider is configured."
    };
  }
}
