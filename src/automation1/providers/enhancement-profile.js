export const ENHANCEMENT_PROFILE_NAME = "Miles & Meals Natural Travel Enhancement Profile";
export const ENHANCEMENT_PROFILE_VERSION = "1.0";

/**
 * Cloudinary transformation chain implementing the Miles & Meals Natural
 * Travel Enhancement Profile.
 *
 * Every component below is a deterministic, per-pixel correction performed
 * by Cloudinary's automatic image-correction engine (Viesus) and bounded
 * tonal/color adjustments. None of them are generative/diffusion effects,
 * so this profile structurally cannot add, remove, or invent scene content,
 * people, buildings, weather, or landscape features -- it can only adjust
 * the exposure, white balance, contrast, color, clarity, and noise of
 * pixels that already exist in the original photo. This is what makes the
 * "never hallucinate / never invent scenery" rules enforceable by
 * architecture rather than by hoping a generative model behaves.
 *
 * - e_viesus_correct: AI-driven automatic exposure, white balance, dynamic
 *   range, and highlight/shadow recovery, adaptive per image. This is the
 *   "professional Lightroom auto-edit" pass and adapts its correction to
 *   each photo's own lighting condition (sunny, indoor, overcast, snow,
 *   night, etc.) without scene-specific code branches.
 * - e_auto_contrast / e_auto_color: gentle, capped local contrast and color
 *   balance for a natural finish. Caps are conservative to avoid HDR looks,
 *   oversaturation, and color clipping.
 * - e_vibrance: natural vibrance (not saturation), protecting skin tones
 *   and avoiding neon greens or oversaturated skies.
 * - e_sharpen: mild clarity/texture recovery without halos or artificial
 *   over-sharpening.
 */
export const NATURAL_ENHANCEMENT_TRANSFORMATION = [
  "e_viesus_correct",
  "e_auto_contrast:25",
  "e_auto_color:25",
  "e_vibrance:20",
  "e_sharpen:40"
].join("/");
