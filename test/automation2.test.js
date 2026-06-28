import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  initializeAutomation2,
  runAutomation2,
  getAutomation2Status,
  watchAutomation2
} from "../src/automation2/pipeline.js";
import { createConfig } from "../src/automation2/config.js";
import { readState, writeState } from "../src/automation2/state-store.js";
import { watchReadyFolder } from "../src/automation2/watcher.js";

async function createTempWorkspace() {
  return fs.mkdtemp(path.join(os.tmpdir(), "miles-meals-automation2-"));
}

test("initializeAutomation2 creates the required Automation 2 folders", async () => {
  const root = await createTempWorkspace();
  const result = await initializeAutomation2({ root });

  assert.equal(result.root, root);
  await fs.access(path.join(root, "Instagram Ready"));
  await fs.access(path.join(root, "Posting Package"));
  await fs.access(path.join(root, ".automation2", "state.json"));
});

test("runAutomation2 generates a posting package with caption, hashtags, ALT text, and checklist", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });
  await fs.writeFile(path.join(root, "Instagram Ready", "swiss-mountain-lake.jpg"), "fake-image-bytes");

  const result = await runAutomation2({ root, stabilityCheckMs: 0 });
  const status = await getAutomation2Status({ root });

  assert.equal(result.candidateCount, 1);
  assert.equal(result.processed, 1);
  assert.equal(status.generatedCount, 1);

  const markdown = await fs.readFile(path.join(root, "Posting Package", "swiss-mountain-lake.md"), "utf8");
  assert.match(markdown, /Posting Package: swiss-mountain-lake\.jpg/);
  assert.match(markdown, /Location: __________/);
  assert.match(markdown, /## Suggested Hashtags/);
  assert.match(markdown, /#MilesAndMeals/);
  assert.match(markdown, /## ALT Text \(Draft\)/);
  assert.match(markdown, /## Posting Checklist/);
  assert.match(markdown, /- \[ \] Caption reviewed/);
  assert.match(markdown, /- \[ \] Ready to publish/);
  assert.match(markdown, /## Processing Log/);
  assert.match(markdown, /does not publish content/);

  const originalImage = await fs.readFile(path.join(root, "Instagram Ready", "swiss-mountain-lake.jpg"), "utf8");
  assert.equal(originalImage, "fake-image-bytes");
});

test("runAutomation2 never overwrites an existing posting package", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });
  await fs.writeFile(path.join(root, "Instagram Ready", "cafe-paris.jpg"), "fake-image-bytes");
  await fs.mkdir(path.join(root, "Posting Package"), { recursive: true });
  await fs.writeFile(path.join(root, "Posting Package", "cafe-paris.md"), "# Hand-edited posting package\n");

  const result = await runAutomation2({ root, stabilityCheckMs: 0 });

  assert.equal(result.processed, 0);
  assert.equal(result.skipped, 1);

  const markdown = await fs.readFile(path.join(root, "Posting Package", "cafe-paris.md"), "utf8");
  assert.equal(markdown, "# Hand-edited posting package\n");
});

test("runAutomation2 marks unsupported files as invalid and does not generate a package", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });
  await fs.writeFile(path.join(root, "Instagram Ready", "notes.txt"), "not an image");

  const result = await runAutomation2({ root, stabilityCheckMs: 0 });
  const status = await getAutomation2Status({ root });

  assert.equal(result.invalid, 1);
  assert.equal(result.processed, 0);
  assert.equal(status.invalidCount, 1);
  await assert.rejects(fs.access(path.join(root, "Posting Package", "notes.md")));
});

test("runAutomation2 is idempotent across repeated runs", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });
  await fs.writeFile(path.join(root, "Instagram Ready", "city-explorer.jpg"), "fake-image-bytes");

  const first = await runAutomation2({ root, stabilityCheckMs: 0 });
  const second = await runAutomation2({ root, stabilityCheckMs: 0 });

  assert.equal(first.processed, 1);
  assert.equal(second.processed, 0);
  assert.equal(second.skipped, 1);
});

test("writeState writes atomically and readState recovers from a corrupted state file", async () => {
  const root = await createTempWorkspace();
  const config = createConfig({ root });
  await initializeAutomation2({ root });

  const state = await readState(config);
  state.packages["abc123"] = { id: "abc123", status: "generated" };
  await writeState(config, state);

  const reloaded = await readState(config);
  assert.equal(reloaded.packages.abc123.status, "generated");

  await fs.writeFile(config.statePath, "{ not valid json", "utf8");
  const recovered = await readState(config);
  assert.deepEqual(recovered.packages, {});

  const stateDirEntries = await fs.readdir(path.dirname(config.statePath));
  assert.ok(stateDirEntries.some((name) => name.includes(".corrupt-")));
});

test("a failed posting package write leaves no temp file behind", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });

  await fs.writeFile(path.join(root, "Instagram Ready", "broken.jpg"), "fake-image-bytes");

  const postingPackageDir = path.join(root, "Posting Package");
  await fs.chmod(postingPackageDir, 0o500);

  try {
    const result = await runAutomation2({ root, stabilityCheckMs: 0 });
    assert.equal(result.failed, 1);

    const postingPackageEntries = await fs.readdir(postingPackageDir);
    assert.ok(!postingPackageEntries.some((name) => name.includes(".tmp-")));
  } finally {
    await fs.chmod(postingPackageDir, 0o700);
  }
});

test("watchAutomation2 logs and survives a failing run instead of crashing", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });

  await fs.writeFile(path.join(root, "Instagram Ready", "broken.jpg"), "fake-image-bytes");

  const postingPackageDir = path.join(root, "Posting Package");
  await fs.chmod(postingPackageDir, 0o500);

  try {
    const handle = await watchAutomation2({ root, stabilityCheckMs: 0 }, { onRun: () => {} });
    await handle.close();

    const status = await getAutomation2Status({ root });
    assert.equal(status.failedCount, 1);
  } finally {
    await fs.chmod(postingPackageDir, 0o700);
  }
});

test("watchReadyFolder triggers a run after a new file appears", async () => {
  const root = await createTempWorkspace();
  await initializeAutomation2({ root });
  const config = createConfig({ root });

  let runCount = 0;
  const handle = watchReadyFolder(config, () => {
    runCount += 1;
  });

  await fs.writeFile(path.join(config.directories["Instagram Ready"], "trigger.jpg"), "fake-image-bytes");
  await new Promise((resolve) => setTimeout(resolve, 500));

  handle.close();
  assert.ok(runCount >= 1);
});
