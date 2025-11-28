import { z } from "zod";
import LZString from "lz-string";

// Define Zod schema for validation
const ColorGeneratorStateSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  tertiaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  layerCount: z.number().min(1).max(20),
  bgMode: z.enum(["sync", "custom"]),
  customBgHue: z.number().min(0).max(360).optional(),
  customBgChroma: z.number().min(0).max(0.04).optional(),
  baseMode: z.enum(["light", "dark"]),
  layerDirection: z.enum(["normal", "inverted"]),
});

export type ColorGeneratorState = z.infer<typeof ColorGeneratorStateSchema>;

export function serializeState(state: ColorGeneratorState): string {
  const json = JSON.stringify(state);
  return LZString.compressToEncodedURIComponent(json);
}

export function deserializeState(
  searchParams: URLSearchParams
): Partial<ColorGeneratorState> {
  const compressed = searchParams.get("s");
  if (!compressed) return {};

  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return {};

    const parsed = JSON.parse(json);
    const result = ColorGeneratorStateSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    } else {
      console.error("Invalid state in URL:", result.error);
      return {};
    }
  } catch (error) {
    console.error("Failed to deserialize state:", error);
    return {};
  }
}
