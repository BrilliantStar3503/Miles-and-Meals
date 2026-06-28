import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { BaseEnhancementProvider } from "./base-provider.js";
import {
  ENHANCEMENT_PROFILE_NAME,
  ENHANCEMENT_PROFILE_VERSION,
  NATURAL_ENHANCEMENT_TRANSFORMATION
} from "./enhancement-profile.js";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}" for the Cloudinary enhancement provider. ` +
        "See .env.example and docs/FEATURES/automation-1.md for setup instructions."
    );
  }

  return value;
}

function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export class CloudinaryEnhancementProvider extends BaseEnhancementProvider {
  constructor() {
    super("cloudinary");
  }

  async enhance({ sourcePath, destinationPath, mediaId }) {
    const cloudName = requiredEnv("CLOUDINARY_CLOUD_NAME");
    const apiKey = requiredEnv("CLOUDINARY_API_KEY");
    const apiSecret = requiredEnv("CLOUDINARY_API_SECRET");
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "miles-and-meals/automation1";
    const transformation =
      process.env.CLOUDINARY_ENHANCEMENT_TRANSFORMATION ?? NATURAL_ENHANCEMENT_TRANSFORMATION;
    const deleteAfterDownload = process.env.CLOUDINARY_DELETE_AFTER_DOWNLOAD !== "false";

    const publicId = `${mediaId ?? path.basename(sourcePath, path.extname(sourcePath))}-${Date.now()}`;
    const enhancedUrl = await this.#upload({
      sourcePath,
      cloudName,
      apiKey,
      apiSecret,
      folder,
      publicId,
      transformation
    });

    const enhancedBuffer = await this.#download(enhancedUrl);
    await this.#writeAtomically(destinationPath, enhancedBuffer);

    if (deleteAfterDownload) {
      const fullPublicId = `${folder}/${publicId}`;
      await this.#destroy({ cloudName, apiKey, apiSecret, publicId: fullPublicId }).catch((error) => {
        console.error(
          `[automation1] WARN Failed to delete Cloudinary asset "${fullPublicId}" after enhancement: ` +
            `${error instanceof Error ? error.message : String(error)}`
        );
      });
    }

    return {
      provider: this.name,
      status: "complete",
      profile: `${ENHANCEMENT_PROFILE_NAME} v${ENHANCEMENT_PROFILE_VERSION}`,
      transformation,
      notes:
        "Enhanced using the Miles & Meals Natural Travel Enhancement Profile via Cloudinary's automatic " +
        "image-correction engine. Only deterministic tonal and color adjustments were applied to the " +
        "original pixels; no generative effects were used."
    };
  }

  async #upload({ sourcePath, cloudName, apiKey, apiSecret, folder, publicId, transformation }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ eager: transformation, folder, public_id: publicId, timestamp }, apiSecret);

    const fileBuffer = await fs.readFile(sourcePath);
    const form = new FormData();
    form.append("file", new Blob([fileBuffer]), path.basename(sourcePath));
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);
    form.append("public_id", publicId);
    form.append("eager", transformation);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Cloudinary upload failed (${response.status}): ${body}`);
    }

    const result = await response.json();
    const eagerResult = result.eager?.[0];

    if (!eagerResult) {
      throw new Error("Cloudinary did not return an eager transformation result.");
    }

    if (eagerResult.status === "failed" || !eagerResult.secure_url) {
      throw new Error(
        `Cloudinary enhancement transformation failed: ${eagerResult.reason ?? "unknown reason"}`
      );
    }

    const url = eagerResult.secure_url;

    return url;
  }

  async #download(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download the enhanced image from Cloudinary (${response.status}).`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async #writeAtomically(destinationPath, buffer) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    const tempPath = `${destinationPath}.tmp-${process.pid}-${Date.now()}`;

    try {
      await fs.writeFile(tempPath, buffer);
      await fs.rename(tempPath, destinationPath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => {});
      throw error;
    }
  }

  async #destroy({ cloudName, apiKey, apiSecret, publicId }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Cloudinary destroy failed (${response.status}): ${body}`);
    }

    const result = await response.json();
    if (result.result !== "ok") {
      throw new Error(`Cloudinary destroy did not confirm deletion (result: "${result.result}").`);
    }
  }
}
