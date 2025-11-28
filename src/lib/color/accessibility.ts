import { wcagContrast } from "culori";

export interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
}

export function getContrastRatio(bg: string, fg: string): number {
  return wcagContrast(bg, fg);
}

export function getContrastResult(bg: string, fg: string): ContrastResult {
  const ratio = getContrastRatio(bg, fg);
  return {
    ratio,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
  };
}

export function formatRatio(ratio: number): string {
  return ratio.toFixed(2);
}
