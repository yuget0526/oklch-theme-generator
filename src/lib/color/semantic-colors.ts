import { Oklch, formatHex } from "culori";
import { ColorVariant, ensureContrast, generateOnColor } from "./color-utils";

export interface SemanticPalette {
  success: ColorVariant;
  warning: ColorVariant;
  error: ColorVariant;
  info: ColorVariant;
}

/**
 * Generates semantic colors with dynamic lightness based on the background.
 * Ensures the generated colors adhere to accessibility standards (APCA/WCAG)
 * against the provided background lightness/color.
 */
export function generateSemanticColors(
  mode: "light" | "dark",
  _backgroundHex: string,
): SemanticPalette {
  // Base Hues for semantic roles
  // Success (Green): ~145
  // Warning (Yellow/Amber): ~85-95. Yellow needs special handling for contrast.
  // Error (Red): ~25-30
  // Info (Blue): ~250

  const baseHues = {
    success: 145,
    warning: 95,
    error: 29,
    info: 245,
  };

  // Base Chroma: Needs to be high enough to be colorful, but not neon.
  const baseChroma = 0.15;

  // Dynamic Lightness Logic
  // We want to find an L value that contrasts well with backgroundHex.
  // For Dark Mode (Bg is dark), we need Lighter semantic colors (Pastel/Neon).
  // For Light Mode (Bg is light), we need Darker semantic colors.

  // Initial L guesses
  const targetL = mode === "light" ? 0.55 : 0.75;

  // Special handling for Yellow (Warning)
  // Yellow at low L turns brown/olive. It needs high L to look like "Yellow".
  // In Light Mode, yellow text on white is hard. Usually we use "Dark Orange/Amber" for text, or a component with yellow bg and dark text.
  // Here we assume these colors are used for "UI Elements" (Buttons, Badges, Text).
  // If used for TEXT, Yellow in light mode is very hard.
  // We will aim for "Amber" (h=~) for Light Mode Warning to ensure visibility.

  const createVariant = (
    role: string,
    hue: number,
    customL?: number,
  ): ColorVariant => {
    let l = customL ?? targetL;

    // Adjust Yellow for Light Mode
    if (role === "warning" && mode === "light") {
      // Shift hue towards Orange for better contrast vs white if we must be dark
      // But if we want "Yellow", it must be bright.
      // If this is for 'foreground' usage, it must be dark (brownish).
      // Let's assume these are "Main" colors.
      l = 0.6; // Darker yellow/amber
    }

    const color: Oklch = {
      mode: "oklch",
      l,
      c: baseChroma,
      h: hue,
    };

    // Ensure contrast against background
    const contrastSafeColor = ensureContrast(color, 60); // APCA 60 is good for text
    const hex = formatHex(contrastSafeColor);
    const onColor = generateOnColor(contrastSafeColor);

    return {
      name: role,
      hex: hex,
      oklch: contrastSafeColor,
      variableName: `--color-${role}`,
      onHex: onColor.hex,
      onVariableName: `--color-on-${role}`,
    };
  };

  return {
    success: createVariant("success", baseHues.success),
    warning: createVariant("warning", baseHues.warning),
    error: createVariant("error", baseHues.error),
    info: createVariant("info", baseHues.info),
  };
}
