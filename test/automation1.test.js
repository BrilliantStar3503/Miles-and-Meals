import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  initializeAutomation1,
  runAutomation1,
  getAutomation1Status
} from "../src/automation1/pipeline.js";
import { createProvider, registerProvider } from "../src/automation1/providers/index.js";
import { BaseEnhancementProvider } from "../src/automation1/providers/base-provider.js";

async function createTempWorkspace() {
  return fs.mkdtemp(path.join(os.tmpdir(), "miles-meals-automation1-"));
}

test("initializeAutomation1 creates the required Automation 1 folders", async () => {
  const root = await createTempWorkspace();
  const result = await initializeAutomation1({ root });

  assert.equal(result.root, root);
  assert.equal(result.provider, "passthrough");
  await fs.access(path.join(root, "Instagram Candidates"));
  await fs.access(path.join(root, "Enhanced"));
  await fs.access(path.join(root, "Lightroom Ready"));
  await fs.access(path.join(root, ".automation1", "state.json"));
});

test("runAutomation1 validates and enhances candidate media using the pass-through provider", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "swiss-mountain-lake.jpg"), "fake-image-bytes");

  const result = await runAutomation1({ root, stabilityCheckMs: 0 });
  const status = await getAutomation1Status({ root });

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

  const result = await runAutomation1({ root, stabilityCheckMs: 0 });
  const status = await getAutomation1Status({ root });

  assert.equal(result.invalid, 1);
  assert.equal(result.processed, 0);
  assert.equal(status.invalidCount, 1);
  await assert.rejects(fs.access(path.join(root, "Enhanced", "notes.txt")));
});

test("runAutomation1 is idempotent and skips media already enhanced", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation1({ root });
  await fs.writeFile(path.join(root, "Instagram Candidates", "cafe-paris.jpg"), "fake-image-bytes");

  const first = await runAutomation1({ root, stabilityCheckMs: 0 });
  const second = await runAutomation1({ root, stabilityCheckMs: 0 });

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
