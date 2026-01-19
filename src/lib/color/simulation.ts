import {
  formatHex,
  converter,
  differenceCiede2000,
  wcagContrast,
  Color,
} from "culori";

// Simulation types
export type SimulationType =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

// LMS matrices from "Digital Video Colourmaps for Checking the Legibility of Displays by Dichromats" (Brettel et al., 1997)
// and "Computerized simulation of color appearance for dichromats" (Brettel et al., 1999)
// Adapted for sRGB linear space.

// RGB to LMS matrix
const RGB_TO_LMS = [
  [17.8824, 43.5161, 4.11935],
  [3.45565, 27.1554, 3.86714],
  [0.0299566, 0.184309, 1.46709],
];

// LMS to RGB matrix
const LMS_TO_RGB = [
  [0.0809444479, -0.130504409, 0.116721066],
  [-0.0102485335, 0.0540193266, -0.113614708],
  [-0.000365296938, -0.00412161469, 0.693511405],
];

// Simulation matrices for LMS space
const PROTANOPIA = [
  [0, 2.02344, -2.52581],
  [0, 1, 0],
  [0, 0, 1],
];

const DEUTERANOPIA = [
  [1, 0, 0],
  [0.494207, 0, 1.24827],
  [0, 0, 1],
];

const TRITANOPIA = [
  [1, 0, 0],
  [0, 1, 0],
  [-0.395913, 0.801109, 0],
];

// Helpers for matrix multiplication
const multiply = (matrix: number[][], vector: number[]) => {
  return [
    matrix[0][0] * vector[0] +
      matrix[0][1] * vector[1] +
      matrix[0][2] * vector[2],
    matrix[1][0] * vector[0] +
      matrix[1][1] * vector[1] +
      matrix[1][2] * vector[2],
    matrix[2][0] * vector[0] +
      matrix[2][1] * vector[1] +
      matrix[2][2] * vector[2],
  ];
};

// Converters
const toRgb = converter("rgb");

export function simulateColorBlindness(
  hex: string,
  type: SimulationType,
): string {
  if (type === "none") return hex;
  const rgb = toRgb(hex);
  if (!rgb) return hex;

  // Linearize RGB (approximate gamma correction removal)
  const linearR =
    rgb.r <= 0.04045 ? rgb.r / 12.92 : Math.pow((rgb.r + 0.055) / 1.055, 2.4);
  const linearG =
    rgb.g <= 0.04045 ? rgb.g / 12.92 : Math.pow((rgb.g + 0.055) / 1.055, 2.4);
  const linearB =
    rgb.b <= 0.04045 ? rgb.b / 12.92 : Math.pow((rgb.b + 0.055) / 1.055, 2.4);

  let simulatedLinearRgb: number[];

  if (type === "achromatopsia") {
    // Standard weighted grayscale conversion for Linear RGB
    // Using Rec. 709 luminance coefficients
    const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
    simulatedLinearRgb = [luminance, luminance, luminance];
  } else {
    // For P/D/T types, use LMS method

    // Convert to LMS
    const lms = multiply(RGB_TO_LMS, [linearR, linearG, linearB]);

    // Apply simulation matrix
    let simulatedLms: number[];
    switch (type) {
      case "protanopia":
        simulatedLms = multiply(PROTANOPIA, lms);
        break;
      case "deuteranopia":
        simulatedLms = multiply(DEUTERANOPIA, lms);
        break;
      case "tritanopia":
        simulatedLms = multiply(TRITANOPIA, lms);
        break;
      default:
        simulatedLms = lms;
    }

    // Convert back to RGB
    simulatedLinearRgb = multiply(LMS_TO_RGB, simulatedLms);
  }

  // Apply gamma correction
  const r =
    simulatedLinearRgb[0] <= 0.0031308
      ? 12.92 * simulatedLinearRgb[0]
      : 1.055 * Math.pow(simulatedLinearRgb[0], 1 / 2.4) - 0.055;
  const g =
    simulatedLinearRgb[1] <= 0.0031308
      ? 12.92 * simulatedLinearRgb[1]
      : 1.055 * Math.pow(simulatedLinearRgb[1], 1 / 2.4) - 0.055;
  const b =
    simulatedLinearRgb[2] <= 0.0031308
      ? 12.92 * simulatedLinearRgb[2]
      : 1.055 * Math.pow(simulatedLinearRgb[2], 1 / 2.4) - 0.055;

  // Clamp values
  const clamp = (val: number) => Math.min(Math.max(val, 0), 1);

  // Format as hex using culori
  const result: Color = { mode: "rgb", r: clamp(r), g: clamp(g), b: clamp(b) };
  return formatHex(result);
}

// Function to check distinguishability
// Returns true if colors are distinguishable (Delta E > threshold or contrast sufficient)
export function isDistinguishable(
  color1: string,
  color2: string,
  threshold = 2,
  minContrast = 3,
): boolean {
  const c1 = toRgb(color1);
  const c2 = toRgb(color2);
  if (!c1 || !c2) return true;

  // 1. Check CIEDE2000 Distance (Perceptual difference)
  // differenceCiede2000() returns a factory function, but can also be used as differenceCiede2000(c1, c2) in some versions?
  // Checking types... usually it's `differenceCiede2000()(c1, c2)`.
  // Safer to use the factory pattern.
  const diffFn = differenceCiede2000();
  const deltaE = diffFn(c1, c2);

  // 2. Check Contrast Ratio (Readability)
  const contrast = wcagContrast(c1, c2);

  // If distinctive enough or has high contrast, valid.
  return deltaE > threshold || contrast > minContrast;
}
