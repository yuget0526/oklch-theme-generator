import { wcagContrast, converter } from "culori";
// @ts-expect-error: apca-w3 has no types
import * as APCA from "apca-w3";

const toRgb = converter("rgb");

/**
 * 色文字列を 0xRRGGBB 形式の整数に変換します。
 */
function toIntColor(color: string): number {
  const rgb = toRgb(color);
  if (!rgb) return 0;
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return (r << 16) | (g << 8) | b;
}

export interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  /** APCA Lc値 (-108 ~ 106) */
  apca: number;
  /** APCAに基づく評価レベル */
  apcaLevel: string;
}

export function getContrastRatio(bg: string, fg: string): number {
  return wcagContrast(bg, fg);
}

/**
 * APCA (Advanced Perceptual Contrast Algorithm) コントラスト値 (Lc) を計算します。
 *
 * @param bg 背景色
 * @param fg 前景色（文字色）
 * @returns Lc値 (-108 ~ 106)。絶対値が大きいほどコントラストが高い。
 *          正の値: 暗い背景に明るい文字
 *          負の値: 明るい背景に暗い文字
 */
export function getAPCAContrast(bg: string, fg: string): number {
  try {
    const bgInt = toIntColor(bg);
    const fgInt = toIntColor(fg);

    // Try to find the function
    const apcaFunc = APCA.calcAPCA || APCA.APCAcontrast || APCA.default;

    if (typeof apcaFunc !== "function") {
      console.error("APCA function not found in module:", APCA);
      return 0;
    }

    // calcAPCA(textColor, backgroundColor)
    const score = apcaFunc(fgInt, bgInt);

    return typeof score === "number" ? score : 0;
  } catch (e) {
    console.error("APCA calculation failed", e);
    return 0;
  }
}

/**
 * Lc値に基づいて推奨される用途（レベル）を判定します。
 *
 * 基準（概算）:
 * - Lc 90+: 本文 (Preferred)
 * - Lc 75+: 本文 (Minimum)
 * - Lc 60+: 大きな文字 (Large Text)
 * - Lc 45+: 見出し (Headers)
 * - Lc 30+: 装飾 (Spot Text)
 */
export function getAPCALevel(lc: number): string {
  const absLc = Math.abs(lc);
  if (absLc >= 90) return "Preferred Body";
  if (absLc >= 75) return "Body Text";
  if (absLc >= 60) return "Large Text";
  if (absLc >= 45) return "Headers";
  if (absLc >= 30) return "Spot Text";
  return "Fail";
}

export function getContrastResult(bg: string, fg: string): ContrastResult {
  const ratio = getContrastRatio(bg, fg);
  const apca = getAPCAContrast(bg, fg);

  return {
    ratio,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
    apca,
    apcaLevel: getAPCALevel(apca),
  };
}

export function formatRatio(ratio: number): string {
  return ratio.toFixed(2);
}

export function formatAPCA(lc: number): string {
  return `Lc ${Math.round(Math.abs(lc))}`;
}
