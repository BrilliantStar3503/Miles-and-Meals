import fs from "node:fs/promises";
import path from "node:path";
import { analyzeScene } from "./scene-intelligence.js";
import { recommendPreset } from "./preset-recommendation.js";

export function createDraft(media, options = {}) {
  const sceneAnalysis = analyzeScene(media);
  const presetRecommendation = recommendPreset(sceneAnalysis);
  const destination = options.destination ?? "destination to verify";
  const subject = media.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return {
    id: `draft-${media.id}`,
    status: "pending_approval",
    sourceMediaId: media.id,
    sourcePath: media.relativePath,
    generatedAt: new Date().toISOString(),
    authenticityNotice:
      "Draft copy is generated from available file context only. Verify destination, facts, and captions before publishing.",
    platformDrafts: {
      instagram: {
        caption: `A Miles & Meals moment from ${destination}: ${subject}. Refine this with the real story before approval.`,
        hashtags: ["#MilesAndMeals", "#TravelPhotography", "#FoodAndTravel", "#TravelStory"],
        callToAction: "Save this for future travel inspiration."
      },
      facebook: {
        caption: `A travel moment worth revisiting: ${subject}. Add verified context and the human story before publishing.`
      },
      threads: {
        post: `${subject} — a small travel moment for the Miles & Meals archive.`
      },
      pinterest: {
        description: `${subject} travel inspiration from Miles & Meals. Verify destination details before publishing.`
      }
    },
    accessibility: {
      altText: `Travel media file titled ${subject}. Replace this draft with a precise visual description before approval.`
    },
    seo: {
      keywords: ["travel", "food travel", "destination guide", "Miles & Meals"]
    },
    scheduling: {
      suggestedPostingTime: "19:00 local time",
      rationale: "Evening posting window placeholder until analytics history is available."
    },
    recommendations: {
      geotag: "Verify before publishing",
      coverImage: media.relativePath,
      preset: presetRecommendation
    },
    sceneAnalysis
  };
}

export async function writeDraft(config, draft) {
  const draftPath = path.join(config.directories.Drafts, `${draft.id}.json`);
  await fs.mkdir(path.dirname(draftPath), { recursive: true });
  await fs.writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  return draftPath;
}
