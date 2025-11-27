import { formatHex, converter, Oklch, wcagContrast } from "culori";

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

function generateOnColor(bgOklch: Oklch): { hex: string; oklch: Oklch } {
  // Threshold for switching to dark text.
  // Higher threshold means we keep using White text for lighter colors.
  const isLightBg = (bgOklch.l || 0) > 0.75;

  // Harmonized off-white/off-black
  const onL = isLightBg ? 0.05 : 0.98;
  const onC = 0.01; // Very subtle chroma to harmonize with hue
  const onOklch: Oklch = { l: onL, c: onC, h: bgOklch.h, mode: "oklch" };

  return { hex: formatHex(onOklch), oklch: onOklch };
}

/**
 * Generates brand color variants (Default, Light, Dark).
 */
export function generateBrandColors(
  baseColorHex: string,
  role: string
): ColorVariant[] {
  const baseOklch = toOklch(baseColorHex);
  if (!baseOklch) {
    throw new Error("Invalid base color");
  }

  const lightOffset = 0.1;
  const darkOffset = 0.1;

  // Calculate light variant
  let lightL = (baseOklch.l || 0) + lightOffset;
  lightL = Math.max(0, Math.min(1, lightL));
  const lightOklch: Oklch = { ...baseOklch, l: lightL, mode: "oklch" };
  const lightHex = formatHex(lightOklch);
  const lightOn = generateOnColor(lightOklch);

  // Calculate dark variant
  let darkL = (baseOklch.l || 0) - darkOffset;
  darkL = Math.max(0, Math.min(1, darkL));
  const darkOklch: Oklch = { ...baseOklch, l: darkL, mode: "oklch" };
  const darkHex = formatHex(darkOklch);
  const darkOn = generateOnColor(darkOklch);

  // Base variant on-color
  const baseOn = generateOnColor(baseOklch);

  // Return in order: Light -> Default -> Dark
  return [
    {
      name: "light",
      hex: lightHex,
      oklch: lightOklch,
      variableName: `--color-${role}-light`,
      onHex: lightOn.hex,
      onVariableName: `--color-on-${role}-light`,
    },
    {
      name: "default",
      hex: baseColorHex,
      oklch: baseOklch,
      variableName: `--color-${role}-default`,
      onHex: baseOn.hex,
      onVariableName: `--color-on-${role}-default`,
    },
    {
      name: "dark",
      hex: darkHex,
      oklch: darkOklch,
      variableName: `--color-${role}-dark`,
      onHex: darkOn.hex,
      onVariableName: `--color-on-${role}-dark`,
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
  direction: "normal" | "inverted" = "normal"
): number[] {
  const isDark = mode === "dark";
  // Light mode: Start bright (0.99), end slightly darker (0.92)
  // Dark mode: Start dark (0.15), end lighter (0.35)
  // We want more separation in the first few layers for dark mode.

  const startL = isDark ? 0.15 : 0.99;
  const endL = isDark ? 0.35 : 0.92;

  const lightnesses: number[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);

    // Use a slight curve for better distribution
    // Ease out for dark mode to gain lightness faster at the beginning?
    // Or ease in?
    // Linear: 0.15, 0.20, 0.25, 0.30, 0.35
    // We want distinct layers.
    // Let's stick to a slightly adjusted curve or just linear but optimized range.
    // User requested "accessible".
    // Let's use a simple power curve.

    // For now, let's keep it linear but with the updated range,
    // as the graph will allow fine-tuning.
    // But we can make it slightly non-linear.
    const curvedT = isDark ? Math.pow(t, 0.8) : t; // Slight curve for dark mode

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
  customLightness?: number[]
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
  name: string
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
  originalVariants: ColorVariant[]
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
  originalScales: LayerScale[]
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
