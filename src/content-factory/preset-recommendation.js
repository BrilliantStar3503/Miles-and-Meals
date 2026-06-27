const PRESET_RULES = [
  ["Alpine Swiss", ["mountain", "lake"]],
  ["Tropical Paradise", ["beach", "ocean"]],
  ["Emerald Forest", ["forest", "waterfall", "wildlife"]],
  ["Cafe Stories", ["food", "restaurant", "cafe"]],
  ["Golden Escape", ["sunrise", "sunset"]],
  ["Night Explorer", ["night"]],
  ["City Explorer", ["city", "architecture", "drone"]]
];

export function recommendPreset(sceneAnalysis) {
  for (const [preset, scenes] of PRESET_RULES) {
    if (sceneAnalysis.scenes.some((scene) => scenes.includes(scene))) {
      return {
        preset,
        applyAutomatically: false,
        reason: `Recommended from scene labels: ${sceneAnalysis.scenes.join(", ")}.`
      };
    }
  }

  return {
    preset: "City Explorer",
    applyAutomatically: false,
    reason: "Default recommendation until richer image analysis is integrated."
  };
}
