import { formatHex, converter, Oklch, wcagContrast } from "culori";
import { getAPCAContrast } from "./accessibility";

export { wcagContrast };

export type ColorRole = "primary" | "secondary" | "tertiary";
export type ThemeMode = "light" | "dark";
export type VariantName = "default" | "light" | "dark";

export interface ColorVariant {
  name: string;
  hex: string;
  oklch: Oklch;
  variableName: string;
  onHex: string;
  onVariableName: string;
}

export interface LayerScale {
  step: number;
  name: string;
  hex: string;
  oklch: Oklch;
  variableName: string; // --color-background, --color-surface-1
  onHex: string;
  onVariableName: string; // --color-on-background, --color-on-surface-1
}

export interface ChromaGroup {
  id: string;
  name: string;
  chroma: number;
  lightness: number;
  // Each item in the group is a set of 3 variants
  colors: {
    hue: number;
    variants: ColorVariant[];
  }[];
}

const toOklch = converter("oklch");

export function generateOnColor(bgOklch: Oklch): { hex: string; oklch: Oklch } {
  const bgHex = formatHex(bgOklch);

  // Candidate 1: Pure White (Light) - Maximize contrast
  const lightOn: Oklch = { l: 1.0, c: 0.0, h: bgOklch.h, mode: "oklch" };
  const lightHex = formatHex(lightOn);

  // Candidate 2: Pure Black (Dark) - Maximize contrast
  const darkOn: Oklch = { l: 0.0, c: 0.0, h: bgOklch.h, mode: "oklch" };
  const darkHex = formatHex(darkOn);

  // Calculate APCA contrast for both
  const lightScore = Math.abs(getAPCAContrast(bgHex, lightHex));
  const darkScore = Math.abs(getAPCAContrast(bgHex, darkHex));

  // Choose the one with higher contrast
  // If scores are very close, prefer dark text on light bg?
  // APCA handles polarity, so absolute value comparison is usually correct.
  // However, if both fail, we might want to adjust the text color further (not implemented yet).

  if (lightScore > darkScore) {
    return { hex: lightHex, oklch: lightOn };
  } else {
    return { hex: darkHex, oklch: darkOn };
  }
}

/**
 * Adjusts the lightness of a color to ensure it meets a minimum APCA contrast
 * with either pure white or pure black.
 */
export function ensureContrast(oklch: Oklch, targetLc: number = 60): Oklch {
  const bgHex = formatHex(oklch);
  const whiteHex = "#ffffff";
  const blackHex = "#000000";

  const whiteScore = Math.abs(getAPCAContrast(bgHex, whiteHex));
  const blackScore = Math.abs(getAPCAContrast(bgHex, blackHex));
  const maxScore = Math.max(whiteScore, blackScore);

  // If already passing, return original
  if (maxScore >= targetLc) {
    return oklch;
  }

  // Determine direction: if closer to white (lighter), go lighter. If closer to black (darker), go darker.
  // Or simply: if current L > 0.5, try going lighter. Else darker.
  // Actually, checking which score is higher tells us which text color is "closer" to working.
  // If whiteScore > blackScore, it means the background is darkish (but not dark enough). So we should make it darker.
  // If blackScore > whiteScore, the background is lightish. We should make it lighter.

  const direction = blackScore > whiteScore ? 1 : -1;
  let currentL = oklch.l || 0;

  // Limit iterations to prevent infinite loops or extreme shifts
  for (let i = 0; i < 50; i++) {
    currentL += direction * 0.01;
    // Clamp
    currentL = Math.max(0, Math.min(1, currentL));

    const newColor: Oklch = { ...oklch, l: currentL };
    const newHex = formatHex(newColor);

    const newWhiteScore = Math.abs(getAPCAContrast(newHex, whiteHex));
    const newBlackScore = Math.abs(getAPCAContrast(newHex, blackHex));

    if (Math.max(newWhiteScore, newBlackScore) >= targetLc) {
      return newColor;
    }

    // If we hit bounds, stop
    if (currentL <= 0 || currentL >= 1) break;
  }

  return oklch; // Return best effort (or original if failed)
}

/**
 * Generates brand color variants (Light Main/Variant, Dark Main/Variant).
 * @param baseColorHex The color selected by the user.
 * @param role The role name (primary, secondary, etc.)
 * @param baseMode The mode the user is currently editing ('light' or 'dark').
 */
export function generateBrandColors(
  baseColorHex: string,
  role: string,
  baseMode: ThemeMode = "light",
): ColorVariant[] {
  const baseOklch = toOklch(baseColorHex);
  if (!baseOklch) {
    throw new Error("Invalid base color");
  }

  // Ensure base color has good contrast
  const adjustedBaseOklch = ensureContrast(baseOklch, 60);
  const adjustedBaseHex = formatHex(adjustedBaseOklch);
  const baseOn = generateOnColor(adjustedBaseOklch);

  let lightMainOklch: Oklch;
  let lightMainHex: string;
  let lightMainOn: { hex: string; oklch: Oklch };

  let darkMainOklch: Oklch;
  let darkMainHex: string;
  let darkMainOn: { hex: string; oklch: Oklch };

  if (baseMode === "light") {
    // --- Light Mode Base ---
    // Input is Light Main
    lightMainOklch = adjustedBaseOklch;
    lightMainHex = adjustedBaseHex;
    lightMainOn = baseOn;

    // Generate Dark Main from Light Main
    // Dark Main: Adjusted for dark background (Lighter, Pastel)
    const darkMainL = 0.75;
    const darkMainOklchRaw: Oklch = {
      ...lightMainOklch,
      l: darkMainL,
      mode: "oklch",
    };
    darkMainOklch = ensureContrast(darkMainOklchRaw, 60);
    darkMainHex = formatHex(darkMainOklch);
    darkMainOn = generateOnColor(darkMainOklch);
  } else {
    // --- Dark Mode Base ---
    // Input is Dark Main
    darkMainOklch = adjustedBaseOklch;
    darkMainHex = adjustedBaseHex;
    darkMainOn = baseOn;

    // Generate Light Main from Dark Main
    // Light Main: Adjusted for light background (Darker, Saturated)
    // If user picked a pastel color for dark mode, we need to darken it for light mode.
    // Target L around 0.5 - 0.6?
    const lightMainL = 0.55;
    const lightMainOklchRaw: Oklch = {
      ...darkMainOklch,
      l: lightMainL,
      mode: "oklch",
    };
    lightMainOklch = ensureContrast(lightMainOklchRaw, 60);
    lightMainHex = formatHex(lightMainOklch);
    lightMainOn = generateOnColor(lightMainOklch);
  }

  // --- Variants Generation ---

  // Light Variant: Slightly different from Light Main (e.g. darker)
  let lightVariantL = (lightMainOklch.l || 0) - 0.1;
  lightVariantL = Math.max(0, Math.min(1, lightVariantL));
  const lightVariantOklchRaw: Oklch = {
    ...lightMainOklch,
    l: lightVariantL,
    mode: "oklch",
  };
  const lightVariantOklch = ensureContrast(lightVariantOklchRaw, 60);
  const lightVariantHex = formatHex(lightVariantOklch);
  const lightVariantOn = generateOnColor(lightVariantOklch);

  // Dark Variant: Slightly different from Dark Main (e.g. darker)
  let darkVariantL = (darkMainOklch.l || 0) - 0.1;
  darkVariantL = Math.max(0, Math.min(1, darkVariantL));
  const darkVariantOklchRaw: Oklch = {
    ...darkMainOklch,
    l: darkVariantL,
    mode: "oklch",
  };
  const darkVariantOklch = ensureContrast(darkVariantOklchRaw, 60);
  const darkVariantHex = formatHex(darkVariantOklch);
  const darkVariantOn = generateOnColor(darkVariantOklch);

  return [
    {
      name: "light",
      hex: lightMainHex,
      oklch: lightMainOklch,
      variableName: `--color-${role}-light`,
      onHex: lightMainOn.hex,
      onVariableName: `--color-on-${role}-light`,
    },
    {
      name: "light-variant",
      hex: lightVariantHex,
      oklch: lightVariantOklch,
      variableName: `--color-${role}-light-variant`,
      onHex: lightVariantOn.hex,
      onVariableName: `--color-on-${role}-light-variant`,
    },
    {
      name: "dark",
      hex: darkMainHex,
      oklch: darkMainOklch,
      variableName: `--color-${role}-dark`,
      onHex: darkMainOn.hex,
      onVariableName: `--color-on-${role}-dark`,
    },
    {
      name: "dark-variant",
      hex: darkVariantHex,
      oklch: darkVariantOklch,
      variableName: `--color-${role}-dark-variant`,
      onHex: darkVariantOn.hex,
      onVariableName: `--color-on-${role}-dark-variant`,
    },
  ];
}

/**
 * Generates default lightness values for layers with improved accessibility.
 * Uses a power curve to ensure better contrast steps.
 */
export function generateDefaultLightness(
  count: number,
  mode: ThemeMode,
  direction: "normal" | "inverted" = "normal",
): number[] {
  const isDark = mode === "dark";
  // Light mode: Start bright (0.99), end slightly darker (0.90)
  // Dark mode: Start dark (0.15), end lighter (0.35)
  // We want more separation in the first few layers for dark mode.

  const startL = isDark ? 0.15 : 0.99;
  const endL = isDark ? 0.35 : 0.9;

  const lightnesses: number[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);

    // Use a slight curve for better distribution
    // Power curve < 1 makes the initial steps larger (faster change)
    // Power curve > 1 makes the initial steps smaller (slower change)
    // For natural lighting/depth, a slight ease-out (faster initial change) often looks better.
    const exponent = isDark ? 0.8 : 0.85;
    const curvedT = Math.pow(t, exponent);

    let l = startL + (endL - startL) * curvedT;

    if (direction === "inverted") {
      l = endL - (endL - startL) * curvedT;
    }

    lightnesses.push(Number(l.toFixed(3)));
  }

  return lightnesses;
}

/**
 * Generates a scale for background layers (neutral/tinted).
 * @param hue The hue to tint the grays with.
 * @param chroma The chroma amount (usually very low, e.g. 0.005).
 * @param count Number of layers.
 * @param mode 'light' or 'dark'.
 * @param direction 'normal' (standard depth) or 'inverted' (reverse depth).
 */
export function generateLayerScale(
  hue: number,
  chroma: number,
  count: number,
  mode: ThemeMode,
  direction: "normal" | "inverted" = "normal",
  customLightness?: number[],
): LayerScale[] {
  // Use custom lightness if provided and matches count, otherwise generate default
  const lightnesses =
    customLightness && customLightness.length === count
      ? customLightness
      : generateDefaultLightness(count, mode, direction);

  return lightnesses.map((l, i) => {
    const name = i === 0 ? "background" : `surface-${i}`;
    const variableName =
      i === 0 ? "--color-background" : `--color-surface-${i}`;
    const onVariableName =
      i === 0 ? "--color-on-background" : `--color-on-surface-${i}`;

    const oklch: Oklch = { l, c: chroma, h: hue, mode: "oklch" };
    const hex = formatHex(oklch);
    const { hex: onHex } = generateOnColor(oklch);

    return {
      step: i + 1,
      name,
      variableName,
      onVariableName,
      hex,
      onHex,
      oklch,
    };
  });
}

/**
 * Generates a chroma group with 3 variants per hue.
 */
export function generateChromaGroup(
  chroma: number,
  lightness: number,
  count: number,
  name: string,
): ChromaGroup {
  const groupColors = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    // Create a base color for this hue
    const baseColor: Oklch = {
      mode: "oklch",
      l: lightness,
      c: chroma,
      h: hue,
    };
    const baseHex = formatHex(baseColor);

    // Generate variants for this hue
    const variants = generateBrandColors(baseHex, `${name}-${i + 1}`);

    groupColors.push({
      hue: hue,
      variants: variants,
    });
  }

  return {
    id: crypto.randomUUID(),
    name,
    chroma,
    lightness,
    colors: groupColors,
  };
}

/**
 * Generates opposite variants.
 */
export function generateOppositeVariants(
  originalVariants: ColorVariant[],
): ColorVariant[] {
  return originalVariants.map((v) => {
    const newL = 1 - (v.oklch.l || 0.5);
    const color: Oklch = {
      ...v.oklch,
      l: Math.max(0.05, Math.min(0.98, newL)),
      mode: "oklch",
    };
    const onColor = generateOnColor(color);

    return {
      ...v,
      hex: formatHex(color),
      oklch: color,
      onHex: onColor.hex,
      // variableName and onVariableName remain the same as they are semantic keys
    };
  });
}

/**
 * Generates opposite layer scale.
 */
export function generateOppositeLayerScale(
  originalScales: LayerScale[],
): LayerScale[] {
  const firstL = originalScales[0].oklch.l || 0;
  const isLight = firstL > 0.5;

  const targetRange = isLight
    ? { start: 0.1, end: 0.25 }
    : { start: 0.98, end: 0.9 };
  const count = originalScales.length;
  const stepSize = (targetRange.end - targetRange.start) / (count - 1);

  return originalScales.map((s, i) => {
    const newL = targetRange.start + i * stepSize;
    const color: Oklch = {
      ...s.oklch,
      l: newL,
      mode: "oklch",
    };

    // Generate On-Color for opposite
    const onColor = generateOnColor(color);

    return {
      ...s,
      hex: formatHex(color),
      oklch: color,
      onHex: onColor.hex,
      // variableName and onVariableName remain the same as they are semantic keys
    };
  });
}

/**
 * Calculates the accessible range of Lightness (0-1) for a given background color
 * to meet a minimum APCA contrast level (default 45 for headers/large text).
 * Returns { min, max }.
 */
export function getAccessibleLightnessRange(
  backgroundHex: string,
  minLc: number = 45,
  chroma: number = 0,
  hue: number = 0,
): { min: number; max: number } {
  const validL: number[] = [];
  const step = 0.02;

  for (let l = 0; l <= 1.0; l += step) {
    const color: Oklch = { mode: "oklch", l, c: chroma, h: hue };
    const hex = formatHex(color);
    const score = Math.abs(getAPCAContrast(backgroundHex, hex));

    if (score >= minLc) {
      validL.push(l);
    }
  }

  if (validL.length === 0) {
    // If no single L value passes (unlikely for reasonable minLc), return full range or safe default
    return { min: 0, max: 1 };
  }

  return {
    min: Math.min(...validL),
    max: Math.max(...validL),
  };
}

/**
 * Generates a random color palette with harmonious relationships.
 * Uses Triadic or Split-Complementary harmony for better results.
 * Constrains lightness based on background contrast if provided.
 */
export function generateRandomPalette(backgroundHex?: string): {
  primary: string;
  secondary: string;
  tertiary: string;
} {
  // Random Hue for Primary (0-360)
  const primaryHue = Math.floor(Math.random() * 360);

  // Randomize harmony strategy
  const strategy = Math.random();
  let secondaryHue: number;
  let tertiaryHue: number;

  if (strategy < 0.33) {
    // Triadic (120 degrees apart)
    secondaryHue = (primaryHue + 120) % 360;
    tertiaryHue = (primaryHue + 240) % 360;
  } else if (strategy < 0.66) {
    // Split Complementary (150 degrees apart)
    secondaryHue = (primaryHue + 150) % 360;
    tertiaryHue = (primaryHue + 210) % 360;
  } else {
    // Analogous (30-60 degrees apart)
    secondaryHue = (primaryHue + 40) % 360;
    tertiaryHue = (primaryHue - 40 + 360) % 360;
  }

  // Determine safe lightness range
  let minL = 0.45;
  let maxL = 0.75;
  const targetC = 0.15; // Typical vibrant chroma

  if (backgroundHex) {
    const range = getAccessibleLightnessRange(
      backgroundHex,
      45,
      targetC,
      primaryHue,
    );
    // Clamp to reasonable UI colors (don't go too black or too white even if allowed)
    minL = Math.max(0.3, range.min);
    maxL = Math.min(0.9, range.max);

    // If range is inverted (e.g. dark bg allows 0.6-1.0), ensure we pick valid
    if (minL > maxL) {
      // Fallback
      minL = range.min;
      maxL = range.max;
    }
  }

  // Randomize Lightness and Chroma slightly for variation
  const l = minL + Math.random() * (maxL - minL);
  const c = targetC + (Math.random() * 0.05 - 0.025); // 0.125 - 0.175

  const p: Oklch = { mode: "oklch", l, c, h: primaryHue };
  const s: Oklch = { mode: "oklch", l, c, h: secondaryHue };
  const t: Oklch = { mode: "oklch", l, c, h: tertiaryHue };

  return {
    primary: formatHex(p),
    secondary: formatHex(s),
    tertiary: formatHex(t),
  };
}
