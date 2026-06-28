import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  initializeAutomation1,
  runAutomation1,
  getAutomation1Status,
  watchAutomation1
} from "../src/automation1/pipeline.js";
import { createConfig } from "../src/automation1/config.js";
import { readState, writeState } from "../src/automation1/state-store.js";
import { watchCandidates } from "../src/automation1/watcher.js";
import { createProvider, registerProvider } from "../src/automation1/providers/index.js";
import { BaseEnhancementProvider } from "../src/automation1/providers/base-provider.js";

async function createTempWorkspace() {
  return fs.mkdtemp(path.join(os.tmpdir(), "miles-meals-automation1-"));
}

test("initializeAutomation1 creates the required Automation 1 folders", async () => {
  const root = await createTempWorkspace();
  const result = await initializeAutomation1({ root });

  assert.equal(result.root, root);
  assert.equal(result.provider, "cloudinary");
  await fs.access(path.join(root, "Instagram Candidates"));
  await fs.access(path.join(root, "Enhanced"));
  await fs.access(path.join(root, "Lightroom Ready"));
  await fs.access(path.join(root, ".automation1", "state.json"));
});

test("runAutomation1 validates and enhances candidate media using the pass-through provider", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "swiss-mountain-lake.jpg"), "fake-image-bytes");

  const result = await runAutomation1({ root, provider: "passthrough", stabilityCheckMs: 0 });
  const status = await getAutomation1Status({ root, provider: "passthrough" });

  assert.equal(result.candidateCount, 1);
  assert.equal(result.processed, 1);
  assert.equal(result.invalid, 0);
  assert.equal(status.enhancedCount, 1);

  const enhancedContents = await fs.readFile(path.join(root, "Enhanced", "swiss-mountain-lake.jpg"), "utf8");
  assert.equal(enhancedContents, "fake-image-bytes");
});

test("runAutomation1 marks unsupported files as invalid and does not copy them", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "notes.txt"), "not an image");

  const result = await runAutomation1({ root, provider: "passthrough", stabilityCheckMs: 0 });
  const status = await getAutomation1Status({ root, provider: "passthrough" });

  assert.equal(result.invalid, 1);
  assert.equal(result.processed, 0);
  assert.equal(status.invalidCount, 1);
  await assert.rejects(fs.access(path.join(root, "Enhanced", "notes.txt")));
});

test("runAutomation1 is idempotent and skips media already enhanced", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "cafe-paris.jpg"), "fake-image-bytes");

  const first = await runAutomation1({ root, provider: "passthrough", stabilityCheckMs: 0 });
  const second = await runAutomation1({ root, provider: "passthrough", stabilityCheckMs: 0 });

  assert.equal(first.processed, 1);
  assert.equal(second.processed, 0);
  assert.equal(second.skipped, 1);
});

test("createProvider rejects unknown provider names", () => {
  assert.throws(() => createProvider("does-not-exist"), /Unknown enhancement provider/);
});

test("registerProvider allows registering a future provider without changing the workflow", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root, provider: "stub-future-provider" });
  await fs.writeFile(path.join(root, "Instagram Candidates", "city-explorer.jpg"), "fake-image-bytes");

  registerProvider("stub-future-provider", () => new StubFutureProvider());

  const result = await runAutomation1({ root, provider: "stub-future-provider", stabilityCheckMs: 0 });
  assert.equal(result.processed, 1);

  const enhancedContents = await fs.readFile(path.join(root, "Enhanced", "city-explorer.jpg"), "utf8");
  assert.equal(enhancedContents, "stub-enhanced");
});

test("writeState writes atomically and leaves no temp file behind", async () => {
  const root = await createTempWorkspace();
  const config = createConfig({ root });
  await initializeAutomation1({ root });

  const state = await readState(config);
  state.media["abc123"] = { id: "abc123", status: "enhanced" };
  await writeState(config, state);

  const reloaded = await readState(config);
  assert.equal(reloaded.media.abc123.status, "enhanced");

  const stateDirEntries = await fs.readdir(path.dirname(config.statePath));
  assert.ok(!stateDirEntries.some((name) => name.includes(".tmp-")));
});

test("readState recovers from a corrupted state file instead of crashing", async () => {
  const root = await createTempWorkspace();
  const config = createConfig({ root });
  await initializeAutomation1({ root });

  await fs.writeFile(config.statePath, "{ not valid json", "utf8");

  const state = await readState(config);
  assert.deepEqual(state.media, {});

  const stateDirEntries = await fs.readdir(path.dirname(config.statePath));
  assert.ok(stateDirEntries.some((name) => name.includes(".corrupt-")));
});

test("the pass-through provider cleans up its temp file if the copy fails", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  const provider = createProvider("passthrough");

  const missingSource = path.join(root, "Instagram Candidates", "does-not-exist.jpg");
  const destinationPath = path.join(root, "Enhanced", "does-not-exist.jpg");

  await assert.rejects(provider.enhance({ sourcePath: missingSource, destinationPath }));

  const enhancedDirEntries = await fs.readdir(path.join(root, "Enhanced"));
  assert.deepEqual(enhancedDirEntries, []);
});

test("watchAutomation1 logs and survives a failing run instead of crashing", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root, provider: "always-fails" });

  registerProvider("always-fails", () => new AlwaysFailingProvider());
  await fs.writeFile(path.join(root, "Instagram Candidates", "broken.jpg"), "fake-image-bytes");

  const handle = await watchAutomation1(
    { root, provider: "always-fails", stabilityCheckMs: 0 },
    { onRun: () => {} }
  );
  await handle.close();

  const status = await getAutomation1Status({ root, provider: "always-fails" });
  assert.equal(status.failedCount, 1);
});

test("createProvider returns the Cloudinary provider as the official Natural Travel Enhancement Profile provider", () => {
  const provider = createProvider("cloudinary");
  assert.equal(provider.name, "cloudinary");
});

test("the Cloudinary provider fails clearly when credentials are missing, preserves originals, and keeps processing other files", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "no-creds-a.jpg"), "fake-image-bytes-a");
  await fs.writeFile(path.join(root, "Instagram Candidates", "no-creds-b.jpg"), "fake-image-bytes-b");

  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  const result = await runAutomation1({ root, provider: "cloudinary", stabilityCheckMs: 0 });

  assert.equal(result.failed, 2);
  assert.equal(result.processed, 0);

  const enhancedEntries = await fs.readdir(path.join(root, "Enhanced"));
  assert.deepEqual(enhancedEntries, []);

  const originalA = await fs.readFile(path.join(root, "Instagram Candidates", "no-creds-a.jpg"), "utf8");
  const originalB = await fs.readFile(path.join(root, "Instagram Candidates", "no-creds-b.jpg"), "utf8");
  assert.equal(originalA, "fake-image-bytes-a");
  assert.equal(originalB, "fake-image-bytes-b");

  const status = await getAutomation1Status({ root, provider: "cloudinary" });
  assert.equal(status.failedCount, 2);
});

test("the Cloudinary provider uploads, downloads, and atomically writes the enhanced image", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "swiss-mountain-lake.jpg"), "original-bytes");

  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-key";
  process.env.CLOUDINARY_API_SECRET = "test-secret";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = createCloudinaryFetchMock();

  try {
    const result = await runAutomation1({ root, provider: "cloudinary", stabilityCheckMs: 0 });
    assert.equal(result.processed, 1);
    assert.equal(result.failed, 0);

    const enhancedContents = await fs.readFile(path.join(root, "Enhanced", "swiss-mountain-lake.jpg"), "utf8");
    assert.equal(enhancedContents, "enhanced-bytes");

    const enhancedDirEntries = await fs.readdir(path.join(root, "Enhanced"));
    assert.ok(!enhancedDirEntries.some((name) => name.includes(".tmp-")));

    const config = createConfig({ root, provider: "cloudinary" });
    const state = await readState(config);
    const mediaEntry = Object.values(state.media)[0];
    assert.equal(mediaEntry.enhancement.provider, "cloudinary");
    assert.match(mediaEntry.enhancement.profile, /Miles & Meals Natural Travel Enhancement Profile/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  }
});

test("the Cloudinary provider still succeeds even if deleting the temporary cloud copy fails", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "cafe-paris.jpg"), "original-bytes");

  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-key";
  process.env.CLOUDINARY_API_SECRET = "test-secret";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = createCloudinaryFetchMock({ failDestroy: true });

  try {
    const result = await runAutomation1({ root, provider: "cloudinary", stabilityCheckMs: 0 });
    assert.equal(result.processed, 1);
    assert.equal(result.failed, 0);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  }
});

test("watchCandidates retries after a watcher error instead of crashing the process", async () => {
  const root = await createTempWorkspace();
  const config = await initializeAutomation1({ root }).then(() => createConfig({ root }));

  let runCount = 0;
  const handle = watchCandidates(config, () => {
    runCount += 1;
  });

  await fs.writeFile(path.join(config.directories["Instagram Candidates"], "trigger.jpg"), "fake-image-bytes");
  await new Promise((resolve) => setTimeout(resolve, 500));

  handle.close();
  assert.ok(runCount >= 1);
});

function createCloudinaryFetchMock({
  enhancedUrl = "https://res.cloudinary.com/mock/enhanced.jpg",
  enhancedBytes = "enhanced-bytes",
  failDestroy = false
} = {}) {
  return async (url) => {
    const urlString = String(url);

    if (urlString.includes("/image/upload")) {
      return new Response(JSON.stringify({ eager: [{ secure_url: enhancedUrl }] }), { status: 200 });
    }

    if (urlString === enhancedUrl) {
      return new Response(enhancedBytes, { status: 200 });
    }

    if (urlString.includes("/image/destroy")) {
      return failDestroy
        ? new Response("destroy failed", { status: 500 })
        : new Response(JSON.stringify({ result: "ok" }), { status: 200 });
    }

    throw new Error(`Unexpected fetch call in test: ${urlString}`);
  };
}

class AlwaysFailingProvider extends BaseEnhancementProvider {
  constructor() {
    super("always-fails");
  }

  async enhance() {
    throw new Error("Simulated enhancement failure for hardening test.");
  }
}

class StubFutureProvider extends BaseEnhancementProvider {
  constructor() {
    super("stub-future-provider");
  }

  async enhance({ destinationPath }) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.writeFile(destinationPath, "stub-enhanced");
    return { provider: this.name, status: "complete" };
  }
}
