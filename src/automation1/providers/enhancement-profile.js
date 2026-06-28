export const ENHANCEMENT_PROFILE_NAME = "Miles & Meals Natural Travel Enhancement Profile";
export const ENHANCEMENT_PROFILE_VERSION = "1.1";

/**
 * Cloudinary transformation chain implementing the Miles & Meals Natural
 * Travel Enhancement Profile.
 *
 * GOAL: every photo should look like it was professionally edited in
 * Lightroom by an experienced travel photographer -- vibrant, crisp, and
 * inviting, but never "obviously AI-enhanced" and never inconsistent with
 * other photos from the same trip.
 *
 * WHY THIS GUARANTEES AUTHENTICITY (architecture, not instruction):
 * every component below is a deterministic, per-pixel correction performed
 * by Cloudinary's automatic image-correction engine (Viesus) and bounded
 * tonal/color adjustments. None of them are generative/diffusion effects,
 * so this profile structurally cannot add, remove, or invent scene content,
 * people, buildings, weather, or landscape features -- it can only adjust
 * the exposure, white balance, contrast, color, clarity, and noise of
 * pixels that already exist in the original photo.
 *
 * WHY THIS GUARANTEES BRAND CONSISTENCY:
 * every "auto" component (e_viesus_correct, e_auto_contrast, e_auto_color)
 * normalizes each photo *toward the same target tonal range*, rather than
 * applying a fixed offset to every photo. A fixed offset (e.g. "+10
 * contrast" on every image) would amplify whatever variance already
 * existed between photos (a flat overcast shot and a contrasty sunny shot
 * would drift further apart). Normalizing toward a shared target is what
 * makes a scrolling Instagram feed look like one consistent editing style
 * even though the raw photos span sunny beaches, dim restaurants, and snowy
 * peaks. The fixed-amount components (e_vibrance, e_unsharp_mask) are kept
 * deliberately mild specifically so they read as a consistent "finish,"
 * not as the dominant editing decision -- the normalization stage does
 * the heavy lifting, the fixed finish just adds a light, repeatable polish.
 *
 * ORDER MIRRORS A LIGHTROOM EDITING WORKFLOW: base exposure/white-balance
 * correction first, then tone (contrast), then color, then presence
 * (vibrance), then detail (sharpening) -- the same order a photographer
 * would work through the Basic/Color/Detail panels.
 *
 * TRANSFORMATION CHAIN:
 *
 * 1. e_viesus_correct
 *    AI-driven automatic exposure, white balance, dynamic range, and
 *    highlight/shadow recovery. This is the "professional Lightroom
 *    auto-edit" pass and is the engine that does the scene-adaptive work:
 *    it inspects each photo's own lighting (sunny, overcast, indoor, snow,
 *    night, etc.) and corrects accordingly, without any scene-classifier
 *    code in this codebase. It is the closest available equivalent to
 *    Lightroom's highlight recovery, shadow recovery, and dehaze sliders --
 *    Cloudinary has no separate parameters for those, so this single
 *    AI-driven pass is relied on for all of them.
 *
 * 2. e_auto_contrast:20
 *    Normalizes contrast toward a consistent target range based on each
 *    photo's own histogram. Recovers local contrast in flat/overcast shots
 *    and prevents already-contrasty sunny/snow shots from being pushed
 *    further into an HDR look. Capped at 20 (of 100) specifically so it
 *    reads as "corrected," not "graded."
 *
 * 3. e_auto_color:20
 *    Normalizes color balance/white balance toward neutral based on each
 *    photo's own color cast. This is what keeps indoor warm-light shots,
 *    snow's blue cast, and outdoor color casts all converging on the same
 *    neutral starting point before vibrance is applied -- without it,
 *    vibrance would amplify whatever cast was already present. Capped at
 *    20 to avoid stripping the natural ambient mood (e.g. indoor warmth,
 *    sunset color) entirely.
 *
 * 4. e_vibrance:22
 *    Boosts muted colors (foliage greens, water blues, sky blues) while
 *    Cloudinary's vibrance algorithm protects already-saturated tones --
 *    most importantly skin tones, which is why vibrance is used here
 *    instead of flat saturation. This is the single component responsible
 *    for "vibrant," "richer blue sky if one exists," "natural greenery,"
 *    and "enhance natural blues only when already present" -- it amplifies
 *    existing color, it cannot invent a color that wasn't there (a gray
 *    sky stays gray; there is no blue to make richer).
 *
 * 5. e_unsharp_mask:60
 *    Edge-aware sharpening for crisp detail (architecture edges, leaf
 *    texture, snow texture, water texture) without the halo artifacts a
 *    naive sharpen can produce at higher strengths. Capped at 60 (a
 *    moderate value) to stay on the "crisp" side of the line rather than
 *    crossing into "obviously sharpened."
 *
 * WHY NOT MORE / WHY NOT STACKED HIGHER:
 * the brief explicitly warns against HDR-style stacking and an "obviously
 * AI-enhanced" look. Each capped value above was chosen so that no single
 * component dominates; removing any one still leaves a believable, natural
 * photo, which is the signal that the profile is additive polish rather
 * than a heavy edit.
 *
 * SCENE GUIDANCE COVERAGE (no per-scene branching in this codebase --
 * coverage comes from the adaptive components above):
 *  - Sunny Outdoor: viesus_correct (highlight recovery, mild dehaze
 *    approximation) + vibrance (richer blue sky/greenery only if present).
 *  - Cloudy / Overcast: auto_contrast (recovers local/cloud contrast) +
 *    vibrance (mild lift, preserves the cloudy mood since it cannot invent
 *    color that isn't there).
 *  - Indoor: auto_color (neutralizes color cast without stripping warmth,
 *    capped at 20) + viesus_correct (shadow recovery, noise reduction) +
 *    vibrance's skin-tone protection (natural skin tones).
 *  - Snow: auto_color (removes blue cast) + viesus_correct (exposure
 *    recovery to prevent clipping on bright snow) + unsharp_mask (snow
 *    texture) -- all capped to keep snow clean and avoid blown highlights.
 *  - Night: viesus_correct (noise reduction, realistic lighting recovery)
 *    + unsharp_mask at a moderate cap (sharpness without overprocessing);
 *    no brightness-boosting component is used, so night stays night.
 *  - Water: vibrance (natural blues/turquoise only if already present) +
 *    viesus_correct (highlight recovery in reflections); no component here
 *    can recolor water that wasn't already blue.
 *  - Architecture: unsharp_mask (edge definition, stone/window texture) +
 *    auto_contrast (local contrast); auto_color is capped low specifically
 *    so building materials keep realistic color.
 *  - Forest: vibrance (richer natural greens, but capped at 22 specifically
 *    to avoid the neon-green look a higher value or flat saturation boost
 *    would produce) + unsharp_mask (leaf detail).
 */
export const NATURAL_ENHANCEMENT_TRANSFORMATION = [
  "e_viesus_correct",
  "e_auto_contrast:20",
  "e_auto_color:20",
  "e_vibrance:22",
  "e_unsharp_mask:60"
].join("/");
