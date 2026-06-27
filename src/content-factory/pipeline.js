import fs from "node:fs/promises";
import path from "node:path";
import { createConfig, FACTORY_DIRECTORIES } from "./config.js";
import { appendEvent, readState, writeState } from "./state-store.js";
import { analyzeScene } from "./scene-intelligence.js";
import { recommendPreset } from "./preset-recommendation.js";
import { copyIfMissing, inspectMedia, listMediaFiles } from "./media.js";
import { createDraft, writeDraft } from "./content-drafts.js";

export async function initializeWorkspace(options = {}) {
  const config = createConfig(options);

  for (const directory of FACTORY_DIRECTORIES) {
    await fs.mkdir(path.join(config.root, directory), { recursive: true });
  }

  const state = await readState(config);
  await appendEvent(config, state, {
    type: "workspace.initialized",
    message: "Content factory workspace initialized."
  });
  await writeState(config, state);

  return {
    root: config.root,
    directories: FACTORY_DIRECTORIES,
    statePath: config.statePath
  };
}

export async function runPipeline(options = {}) {
  const config = createConfig(options);
  await initializeWorkspace(options);

  const state = await readState(config);
  const imported = await importRawMedia(config, state);
  const drafted = await draftInstagramReadyMedia(config, state);

  await writeState(config, state);

  return {
    root: config.root,
    importedRawMedia: imported.length,
    generatedDrafts: drafted.length,
    mediaCount: Object.keys(state.media).length,
    draftCount: Object.keys(state.drafts).length
  };
}

export async function getStatus(options = {}) {
  const config = createConfig(options);
  const state = await readState(config);

  return {
    root: config.root,
    mediaCount: Object.keys(state.media).length,
    draftCount: Object.keys(state.drafts).length,
    eventCount: state.events.length,
    pendingApprovalCount: Object.values(state.drafts).filter((draft) => draft.status === "pending_approval").length
  };
}

async function importRawMedia(config, state) {
  const files = await listMediaFiles(config.directories.RAW);
  const imported = [];

  for (const filePath of files) {
    const media = await inspectMedia(filePath, config.root);
    const existing = state.media[media.id];
    const enhancedPath = path.join(config.directories.Enhanced, media.filename);
    const copied = await copyIfMissing(filePath, enhancedPath);
    const sceneAnalysis = analyzeScene(media);
    const presetRecommendation = recommendPreset(sceneAnalysis);

    state.media[media.id] = {
      ...existing,
      ...media,
      sourceStage: "RAW",
      currentStage: "Enhanced",
      enhancedPath: path.relative(config.root, enhancedPath),
      enhancement: {
        adapter: "local-passthrough",
        status: "complete",
        copiedOriginal: copied,
        notes: "MVP adapter preserves authenticity by copying the original until an AI enhancement provider is configured."
      },
      sceneAnalysis,
      presetRecommendation,
      updatedAt: new Date().toISOString()
    };

    if (!existing) {
      imported.push(state.media[media.id]);
      await appendEvent(config, state, {
        type: "media.imported",
        mediaId: media.id,
        path: media.relativePath
      });
    }
  }

  return imported;
}

async function draftInstagramReadyMedia(config, state) {
  const files = await listMediaFiles(config.directories["Instagram Ready"]);
  const drafted = [];

  for (const filePath of files) {
    const media = await inspectMedia(filePath, config.root);
    const draft = createDraft({
      ...media,
      sourceStage: "Instagram Ready",
      currentStage: "Draft"
    });

    state.media[media.id] = {
      ...state.media[media.id],
      ...media,
      sourceStage: "Instagram Ready",
      currentStage: "Draft",
      updatedAt: new Date().toISOString()
    };

    if (!state.drafts[draft.id]) {
      state.drafts[draft.id] = draft;
      const draftPath = await writeDraft(config, draft);
      drafted.push(draft);
      await appendEvent(config, state, {
        type: "draft.generated",
        mediaId: media.id,
        draftId: draft.id,
        path: path.relative(config.root, draftPath)
      });
    }
  }

  return drafted;
}
