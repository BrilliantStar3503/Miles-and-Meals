const SCENE_KEYWORDS = [
  ["mountain", ["mountain", "alps", "alpine", "peak", "summit", "swiss"]],
  ["beach", ["beach", "sand", "shore"]],
  ["lake", ["lake"]],
  ["ocean", ["ocean", "sea", "coast", "island"]],
  ["waterfall", ["waterfall", "falls"]],
  ["forest", ["forest", "jungle", "woods", "emerald"]],
  ["food", ["food", "meal", "dish", "dinner", "lunch", "breakfast", "dessert"]],
  ["restaurant", ["restaurant", "bistro", "brasserie"]],
  ["cafe", ["cafe", "coffee", "espresso", "bakery"]],
  ["city", ["city", "street", "downtown", "urban"]],
  ["architecture", ["architecture", "building", "cathedral", "museum", "bridge"]],
  ["drone", ["drone", "aerial"]],
  ["sunrise", ["sunrise", "dawn"]],
  ["sunset", ["sunset", "golden-hour", "golden_hour"]],
  ["wildlife", ["wildlife", "animal", "bird"]],
  ["night", ["night", "nocturne", "lights"]]
];

export function analyzeScene(media) {
  const haystack = `${media.filename} ${media.relativePath}`.toLowerCase();
  const scenes = [];

  for (const [scene, keywords] of SCENE_KEYWORDS) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      scenes.push(scene);
    }
  }

  return {
    scenes: scenes.length > 0 ? scenes : ["travel"],
    confidence: scenes.length > 0 ? "filename-keyword" : "fallback",
    notes:
      scenes.length > 0
        ? "Initial MVP scene labels are inferred from filenames and paths."
        : "No scene keyword detected; marked as general travel pending vision analysis."
  };
}
