import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { initializeWorkspace, runPipeline, getStatus } from "../src/content-factory/pipeline.js";

async function createTempFactory() {
  return fs.mkdtemp(path.join(os.tmpdir(), "miles-meals-factory-"));
}

test("initializeWorkspace creates the required content factory folders", async () => {
  const root = await createTempFactory();
  const result = await initializeWorkspace({ root });

  assert.equal(result.root, root);
  await fs.access(path.join(root, "RAW"));
  await fs.access(path.join(root, "Instagram Ready"));
  await fs.access(path.join(root, "content-factory-state.json"));
});

test("runPipeline imports RAW media and creates passthrough enhanced files", async () => {
  const root = await createTempFactory();
  await initializeWorkspace({ root });
  await fs.writeFile(path.join(root, "RAW", "swiss-mountain-lake.jpg"), "fake-image");

  const result = await runPipeline({ root });
  const status = await getStatus({ root });

  assert.equal(result.importedRawMedia, 1);
  assert.equal(status.mediaCount, 1);
  await fs.access(path.join(root, "Enhanced", "swiss-mountain-lake.jpg"));
});

test("runPipeline generates pending approval drafts for Instagram Ready exports", async () => {
  const root = await createTempFactory();
  await initializeWorkspace({ root });
  await fs.writeFile(path.join(root, "Instagram Ready", "cafe-stories-paris.jpg"), "fake-image");

  const result = await runPipeline({ root });
  const status = await getStatus({ root });
  const drafts = await fs.readdir(path.join(root, "Drafts"));

  assert.equal(result.generatedDrafts, 1);
  assert.equal(status.pendingApprovalCount, 1);
  assert.equal(drafts.length, 1);
});
