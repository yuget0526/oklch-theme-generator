import React from "react";
import { ColorVariant, LayerScale, ThemeMode } from "@/lib/color/color-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ContrastBadge from "@/components/ContrastBadge";

interface NestedLayerPreviewProps {
  layers: LayerScale[];
  primary: ColorVariant[];
  secondary: ColorVariant[];
  tertiary: ColorVariant[];
  mode: ThemeMode;
  overrides?: Record<string, string>;
}

export default function NestedLayerPreview({
  layers,
  primary,
  secondary,
  tertiary,
  mode,
  overrides = {},
}: NestedLayerPreviewProps) {
  // We want to show the full depth if possible, or at least a representative set.
  // The user wants "Background" to be reflected.
  // Layer 0 is "background".
  // Layer 1 is "surface-1".

  // If we have layers [Bg, S1, S2, S3, S4].
  // We want the root container to be Bg.
  // Then S1 inside, S2 inside that...

  // Let's use all layers if count is small (<= 7), which is the max now.
  const displayLayers = layers;

  // Get background color (Layer 0)
  const bgLayer = layers[0];
  const bgHex = overrides[bgLayer.variableName] || bgLayer.hex;

  return (
    <div
      className={`h-full w-full overflow-y-auto transition-colors duration-300 ${mode}`}
      style={{ backgroundColor: bgHex }}
    >
      <div className="min-h-full w-full flex flex-col items-center justify-center p-8 relative">
        {/* Label for Layer 0 (Background) */}
        <div className="w-full max-w-5xl flex-1 flex flex-col">
          {/* Label for Layer 0 (Background) */}
          <div
            className="flex justify-between items-center mb-4 px-2 opacity-40 text-[10px] font-mono uppercase tracking-widest pointer-events-none"
            style={{
              color: overrides[bgLayer.onVariableName] || bgLayer.onHex,
            }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current" />
              {bgLayer.name}
            </span>
            <span>{bgHex}</span>
            <ContrastBadge
              bgColor={bgHex}
              fgColor={overrides[bgLayer.onVariableName] || bgLayer.onHex}
              className="ml-2"
            />
          </div>

          <RecursiveLayer
            layers={displayLayers}
            index={1} // Start from Layer 1 (Surface 1)
            primary={primary}
            secondary={secondary}
            tertiary={tertiary}
            mode={mode}
            overrides={overrides}
          />
        </div>
      </div>
    </div>
  );
}

function RecursiveLayer({
  layers,
  index,
  primary,
  secondary,
  tertiary,
  mode,
  overrides,
}: {
  layers: LayerScale[];
  index: number;
  primary: ColorVariant[];
  secondary: ColorVariant[];
  tertiary: ColorVariant[];
  mode: ThemeMode;
  overrides: Record<string, string>;
}) {
  // Base case: We have exhausted the layers or reached the "content" level.
  // But we want to ensure the content (Cards) sits on the *last* layer.
  // If index == layers.length, we are "inside" the last layer.
  // Base case: We want to ensure the content (Cards) sits on the *last* layer.
  // So we stop recursion at the last layer index.
  // If layers.length is 5 (0-4).
  // We want: Outer(0) -> S1(1) -> S2(2) -> S3(3) -> Content -> Cards(4).
  // So we render containers for 1, 2, 3.
  // And at index 4, we stop and render Content + Cards.

  if (index >= layers.length - 1) {
    // We are at the last layer index (e.g., 4).
    // The parent (S3) has already rendered its container.
    // We are now inside S3.
    // We render the Content here.
    // And the Cards will use the current layer (S4).

    const cardLayer = layers[index];
    const cardHex = overrides[cardLayer.variableName] || cardLayer.hex;
    const cardOnHex = overrides[cardLayer.onVariableName] || cardLayer.onHex;

    const getPrimary = (v: string) => {
      const variant = primary.find((i) => i.name === v);
      return variant
        ? overrides[variant.variableName] || variant.hex
        : primary[0].hex;
    };

    const getPrimaryOn = (v: string) => {
      const variant = primary.find((i) => i.name === v);
      return variant
        ? overrides[variant.onVariableName] || variant.onHex
        : "#ffffff";
    };
    const primaryDefault = getPrimary("default");
    const primaryOnDefault = getPrimaryOn("default");

    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="space-y-2">
          <h1
            className="text-4xl font-extrabold tracking-tight lg:text-5xl"
            style={{ color: primaryDefault }}
          >
            Nested Layers
          </h1>
          <p className="text-lg opacity-80 max-w-lg mx-auto">
            This preview demonstrates how the generated background layers create
            depth and hierarchy in your interface.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            style={{ backgroundColor: primaryDefault, color: primaryOnDefault }}
          >
            Get Started
            <ContrastBadge
              bgColor={primaryDefault}
              fgColor={primaryOnDefault}
              className="ml-2 bg-black/20 border-white/20"
            />
          </Button>
          <Button
            size="lg"
            variant="outline"
            style={{
              borderColor: primaryDefault,
              color: primaryDefault,
            }}
          >
            Learn More
            <ContrastBadge
              bgColor="transparent" // Assuming transparent/bg color
              fgColor={primaryDefault}
              className="ml-2 bg-black/10 border-black/10 text-black dark:text-white dark:bg-white/10"
            />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
          {[primary, secondary, tertiary].map((variants, i) => (
            <Card
              key={i}
              className="border-0 shadow-lg backdrop-blur-sm"
              style={{
                // Use the current layer (last layer) for the card background
                backgroundColor: cardHex,
                color: cardOnHex,
              }}
            >
              <CardHeader>
                <CardTitle
                  style={{
                    color:
                      overrides[
                        variants.find((v) => v.name === "default")
                          ?.variableName || ""
                      ] || variants.find((v) => v.name === "default")?.hex,
                  }}
                >
                  {["Primary", "Secondary", "Tertiary"][i]}
                </CardTitle>
                <CardDescription style={{ color: cardOnHex, opacity: 0.7 }}>
                  Color Variants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {variants.map((v) => {
                  const hex = overrides[v.variableName] || v.hex;
                  const onHex = overrides[v.onVariableName] || v.onHex;
                  return (
                    <div
                      key={v.name}
                      className="flex items-center justify-between p-2 rounded"
                      style={{ backgroundColor: hex, color: onHex }}
                    >
                      <span className="text-xs capitalize opacity-90 font-medium">
                        {v.name}
                      </span>
                      {/* <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: hex }}
                      /> */
                      /* No need for circle if the whole bar is colored */}
                      <ContrastBadge
                        bgColor={hex}
                        fgColor={onHex}
                        className="ml-2"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const layer = layers[index];
  const isRoot = index === 0;
  const layerHex = overrides[layer.variableName] || layer.hex;
  const layerOnHex = overrides[layer.onVariableName] || layer.onHex;

  return (
    <div
      className={`flex-1 w-full flex flex-col transition-colors duration-300 ${
        isRoot
          ? "h-full overflow-y-auto"
          : "px-2 py-8 rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/5" // Updated padding: px-2 py-8
      }`}
      style={{
        backgroundColor: layerHex,
        color: layerOnHex,
      }}
    >
      <div className="flex justify-between items-center mb-4 px-2 opacity-40 text-[10px] font-mono uppercase tracking-widest">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-current" />
          {layer.name}
        </span>
        <span>{layerHex}</span>
        <ContrastBadge
          bgColor={layerHex}
          fgColor={layerOnHex}
          className="ml-2"
        />
      </div>

      <RecursiveLayer
        layers={layers}
        index={index + 1}
        primary={primary}
        secondary={secondary}
        tertiary={tertiary}
        mode={mode}
        overrides={overrides}
      />
    </div>
  );
}
